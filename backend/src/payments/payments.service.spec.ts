import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  purchase: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'ABACATEPAY_API_KEY') return 'test-api-key';
    if (key === 'FRONTEND_URL') return 'http://localhost:5173';
    return null;
  }),
};

// Mock AbacatePay SDK
jest.mock('abacatepay-nodejs-sdk', () => {
  return {
    AbacatePay: jest.fn().mockImplementation(() => ({
      billing: {
        create: jest.fn().mockResolvedValue({
          id: 'billing-123',
          url: 'http://checkout.url',
          pix: {
            payload: 'pix-payload',
            url: 'http://pix.url',
          },
          expiresAt: '2026-03-03T00:00:00Z',
        }),
      },
    })),
  };
});

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: typeof mockPrismaService;

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
});
