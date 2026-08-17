import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesService } from './purchases.service';
import { PrismaService } from '../prisma/prisma.service';
import { prismaMock } from '../prisma/__mocks__/prisma.service';
import { AbacatePayService } from '../payments/abacatepay.service';

const abacatePayServiceMock = {
  getOrCreateCustomer: jest.fn(),
  createCheckout: jest.fn(),
  createProduct: jest.fn().mockResolvedValue('ap-prod-id'),
  createTransparentPix: jest
    .fn()
    .mockResolvedValue({ brCode: 'pix-code', brCodeBase64: 'pix-base64' }),
};

describe('PurchasesService', () => {
  let service: PurchasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: AbacatePayService, useValue: abacatePayServiceMock },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
