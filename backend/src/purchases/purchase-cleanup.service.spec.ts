import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseCleanupService } from './purchase-cleanup.service';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseStatus } from '@prisma/client';

describe('PurchaseCleanupService', () => {
  let service: PurchaseCleanupService;
  const mockPurchaseFindUnique = jest.fn();
  const mockPurchaseFindMany = jest.fn();
  const mockPurchaseUpdate = jest.fn();
  const mockProductUpdate = jest.fn();
  const mockTransaction = jest.fn();

  const prismaStub = {
    purchase: {
      findUnique: mockPurchaseFindUnique,
      findMany: mockPurchaseFindMany,
      update: mockPurchaseUpdate,
    },
    product: {
      update: mockProductUpdate,
    },
    $transaction: mockTransaction,
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseCleanupService,
        { provide: PrismaService, useValue: prismaStub },
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

      mockTransaction.mockImplementation(
        (callback: (tx: typeof prismaStub) => Promise<unknown>) =>
          callback(prismaStub),
      );
      mockPurchaseFindUnique.mockResolvedValue(pendingPurchase);
      mockPurchaseUpdate.mockResolvedValue({
        ...pendingPurchase,
        status: PurchaseStatus.CANCELLED,
      });
      mockProductUpdate.mockResolvedValue({
        id: 'prod-1',
        isAvailable: true,
        isReserved: false,
        isSold: false,
      });

      await service.cancelPurchaseIfPending('purchase-1');

      expect(mockPurchaseUpdate).toHaveBeenCalledWith({
        where: { id: 'purchase-1' },
        data: { status: PurchaseStatus.CANCELLED },
      });
      expect(mockProductUpdate).toHaveBeenCalledWith({
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

      mockTransaction.mockImplementation(
        (callback: (tx: typeof prismaStub) => Promise<unknown>) =>
          callback(prismaStub),
      );
      mockPurchaseFindUnique.mockResolvedValue(completedPurchase);

      await service.cancelPurchaseIfPending('purchase-2');

      expect(mockPurchaseUpdate).not.toHaveBeenCalled();
      expect(mockProductUpdate).not.toHaveBeenCalled();
    });
  });

  describe('cleanupExpiredPurchases', () => {
    it('should do nothing if no expired purchases are found', async () => {
      mockPurchaseFindMany.mockResolvedValue([]);

      await service.cleanupExpiredPurchases();

      expect(mockTransaction).not.toHaveBeenCalled();
    });
  });
});
