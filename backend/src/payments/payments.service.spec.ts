import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

const mockPrismaService = {
  purchase: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  product: {
    update: jest.fn(),
  },
  $transaction: jest.fn((promises) => Promise.all(promises)),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'ABACATEPAY_API_KEY') return 'test-api-key';
    if (key === 'ABACATEPAY_WEBHOOK_SECRET') return 'webhook-secret';
    if (key === 'FRONTEND_URL') return 'http://localhost:5173';
    return null;
  }),
};

// Mock AbacatePay SDK
jest.mock('abacatepay-nodejs-sdk', () => {
  return jest.fn().mockImplementation(() => ({
    billing: {
      create: jest.fn().mockResolvedValue({
        error: null,
        data: {
          id: 'billing-123',
          url: 'http://checkout.url',
          pix: {
            payload: 'pix-payload',
            qrCodeUrl: 'http://pix.url',
            expiresAt: '2026-03-03T00:00:00Z',
          },
        },
      }),
    },
  }));
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAbacatePixCharge', () => {
    it('should throw NotFoundException if purchase does not exist', async () => {
      prisma.purchase.findUnique.mockResolvedValue(null);

      await expect(service.createAbacatePixCharge('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should create a charge and update purchase on success', async () => {
      const mockPurchase = {
        id: 'purchase-123',
        price: 100,
        product: { id: 'prod-1', name: 'Product 1' },
        buyer: { name: 'Buyer', email: 'buyer@example.com' },
      };
      prisma.purchase.findUnique.mockResolvedValue(mockPurchase);
      prisma.purchase.update.mockResolvedValue({ ...mockPurchase, paymentStatus: 'PENDING' });

      const result = await service.createAbacatePixCharge('purchase-123');

      expect(prisma.purchase.findUnique).toHaveBeenCalled();
      expect(prisma.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        data: expect.objectContaining({
          abacatePaymentId: 'billing-123',
          paymentStatus: 'PENDING',
        }),
      });
      expect(result).toHaveProperty('paymentId', 'billing-123');
    });
  });

  describe('getPaymentStatus', () => {
    it('should return status if purchase exists', async () => {
      prisma.purchase.findUnique.mockResolvedValue({ paymentStatus: 'COMPLETED' });

      const result = await service.getPaymentStatus('purchase-123');

      expect(result).toEqual({ status: 'COMPLETED' });
    });

    it('should throw NotFoundException if purchase does not exist', async () => {
      prisma.purchase.findUnique.mockResolvedValue(null);

      await expect(service.getPaymentStatus('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('handleWebhook', () => {
    const webhookSecret = 'webhook-secret';
    const payload = {
      event: 'billing.paid',
      data: {
        id: 'bill-123',
        metadata: { purchaseId: 'purchase-123' },
      },
    };
    const rawBody = Buffer.from(JSON.stringify(payload));
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    it('should throw UnauthorizedException if signature is invalid', async () => {
      await expect(
        service.handleWebhook(payload, 'invalid-signature', rawBody),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should update purchase and product when payment is confirmed', async () => {
      const mockPurchase = {
        id: 'purchase-123',
        productId: 'prod-1',
        abacatePaymentId: 'bill-123',
      };
      prisma.purchase.findFirst.mockResolvedValue(mockPurchase);

      const result = await service.handleWebhook(payload, signature, rawBody);

      expect(result).toEqual({ received: true });
      expect(prisma.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        data: expect.objectContaining({
          paymentStatus: 'PAID',
          status: 'COMPLETED',
        }),
      });
      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: { isSold: true, isAvailable: false },
      });
    });

    it('should handle expired payments', async () => {
      const expiredPayload = {
        event: 'pix.expired',
        data: { id: 'bill-123', metadata: { purchaseId: 'purchase-123' } },
      };
      const expiredRawBody = Buffer.from(JSON.stringify(expiredPayload));
      const expiredSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(expiredRawBody)
        .digest('hex');

      const mockPurchase = { id: 'purchase-123', productId: 'prod-1' };
      prisma.purchase.findFirst.mockResolvedValue(mockPurchase);

      await service.handleWebhook(expiredPayload, expiredSignature, expiredRawBody);

      expect(prisma.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-123' },
        data: expect.objectContaining({
          paymentStatus: 'EXPIRED',
          status: 'CANCELLED',
        }),
      });
    });
  });
});
