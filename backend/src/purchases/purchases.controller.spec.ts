import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

describe('PurchasesController', () => {
  let controller: PurchasesController;
  let purchasesService: { findAllBySeller: jest.Mock };

  beforeEach(async () => {
    purchasesService = {
      findAllBySeller: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasesController],
      providers: [
        {
          provide: PurchasesService,
          useValue: purchasesService,
        },
      ],
    }).compile();

    controller = module.get<PurchasesController>(PurchasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should forward pagination and status query params in getSales', async () => {
    purchasesService.findAllBySeller.mockResolvedValue({
      purchases: [],
      pagination: { page: 2, limit: 50, total: 0, totalPages: 0 },
    });

    await controller.getSales(
      { userId: 'seller-1', email: 'seller@test.com', role: 'USER' as never },
      '2',
      '50',
      'COMPLETED',
    );

    expect(purchasesService.findAllBySeller).toHaveBeenCalledWith(
      'seller-1',
      2,
      50,
      'COMPLETED',
    );
  });
});
