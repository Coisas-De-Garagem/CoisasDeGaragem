import { Test, TestingModule } from '@nestjs/testing';
import type { Request } from 'express';
import { QrCodesController } from './qr-codes.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('QrCodesController', () => {
  let controller: QrCodesController;
  const mockFindUnique = jest.fn();
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.resetAllMocks();
    process.env = { ...originalEnv };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodesController],
      providers: [
        {
          provide: PrismaService,
          useValue: {
            product: {
              findUnique: mockFindUnique,
            },
          },
        },
      ],
    }).compile();

    controller = module.get<QrCodesController>(QrCodesController);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('uses the validated Origin header from www.coisasdegaragem.com.br', async () => {
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    mockFindUnique.mockResolvedValue({ id: 'prod-1', qrCode: 'qr-1' });

    const req = {
      headers: { origin: 'https://www.coisasdegaragem.com.br' },
    } as unknown as Request;

    const result = await controller.getQRCode('prod-1', req);

    expect(result.productUrl).toBe(
      'https://www.coisasdegaragem.com.br/product/prod-1',
    );
    expect(result.url).toContain(
      encodeURIComponent('https://www.coisasdegaragem.com.br/product/prod-1'),
    );
  });

  it('uses the validated Origin header from coisasdegaragem.com.br', async () => {
    process.env.NODE_ENV = 'production';
    mockFindUnique.mockResolvedValue({ id: 'prod-2', qrCode: 'qr-2' });

    const req = {
      headers: { origin: 'https://coisasdegaragem.com.br' },
    } as unknown as Request;

    const result = await controller.getQRCode('prod-2', req);

    expect(result.productUrl).toBe(
      'https://coisasdegaragem.com.br/product/prod-2',
    );
  });

  it('ignores untrusted Origin and never falls back to localhost in production', async () => {
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_URL = 'http://localhost:5173';
    mockFindUnique.mockResolvedValue({ id: 'prod-3', qrCode: 'qr-3' });

    const req = {
      headers: { origin: 'https://evil.example.com' },
    } as unknown as Request;

    const result = await controller.getQRCode('prod-3', req);

    expect(result.productUrl).toBe(
      'https://www.coisasdegaragem.com.br/product/prod-3',
    );
  });
});
