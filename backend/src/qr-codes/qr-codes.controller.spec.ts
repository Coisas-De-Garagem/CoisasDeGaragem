import { Test, TestingModule } from '@nestjs/testing';
import { QrCodesController } from './qr-codes.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('QrCodesController', () => {
  let controller: QrCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodesController],
      providers: [
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<QrCodesController>(QrCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
