import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseCleanupService } from './purchase-cleanup.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../prisma/__mocks__/prisma.service';
import { PurchaseStatus } from '@prisma/client';

describe('PurchaseCleanupService', () => {
  let service: PurchaseCleanupService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseCleanupService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<PurchaseCleanupService>(PurchaseCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cancelPurchaseIfPending', () => {
    it('should cancel purchase and release product if purchase is PENDING', async () => {
      const pendingPurchase = {
        id: 'purchase-1',
        productId: 'prod-1',
        status: PurchaseStatus.PENDING,
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock);
      });
      (prismaMock.purchase.findUnique as jest.Mock).mockResolvedValue(
        pendingPurchase,
      );
      (prismaMock.purchase.update as jest.Mock).mockResolvedValue({
        ...pendingPurchase,
        status: PurchaseStatus.CANCELLED,
      });
      (prismaMock.product.update as jest.Mock).mockResolvedValue({
        id: 'prod-1',
        isAvailable: true,
        isReserved: false,
        isSold: false,
      });

      await service.cancelPurchaseIfPending('purchase-1');

      expect(prismaMock.purchase.update).toHaveBeenCalledWith({
        where: { id: 'purchase-1' },
        data: { status: PurchaseStatus.CANCELLED },
      });
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 'prod-1' },
        data: {
          isAvailable: true,
          isReserved: false,
          isSold: false,
        },
      });
    });

    it('should not cancel if purchase is already COMPLETED', async () => {
      const completedPurchase = {
        id: 'purchase-2',
        productId: 'prod-2',
        status: PurchaseStatus.COMPLETED,
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        return callback(prismaMock);
      });
      (prismaMock.purchase.findUnique as jest.Mock).mockResolvedValue(
        completedPurchase,
      );

      await service.cancelPurchaseIfPending('purchase-2');

      expect(prismaMock.purchase.update).not.toHaveBeenCalled();
      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredPurchases', () => {
    it('should do nothing if no expired purchases are found', async () => {
      (prismaMock.purchase.findMany as jest.Mock).mockResolvedValue([]);

      await service.cleanupExpiredPurchases();

      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });
  });
});
