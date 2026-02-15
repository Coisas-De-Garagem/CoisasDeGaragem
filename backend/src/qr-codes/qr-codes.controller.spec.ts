import { Test, TestingModule } from '@nestjs/testing';
import { QrCodesController } from './qr-codes.controller';

describe('QrCodesController', () => {
  let controller: QrCodesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodesController],
    }).compile();

    controller = module.get<QrCodesController>(QrCodesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
