import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prisma: {
    review: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
    testimonial: {
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      review: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      testimonial: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a visible testimonial and return formatted user fields', async () => {
    const createdAt = new Date('2026-11-26T12:00:00Z');
    prisma.testimonial.create.mockResolvedValue({
      id: 't-1',
      userId: 'u-1',
      rating: 5,
      content: 'Excelente plataforma!',
      isFeatured: false,
      isVisible: true,
      createdAt,
      user: { name: 'Raul', avatarUrl: 'https://example.com/a.png' },
    });

    const result = await service.createTestimonial('u-1', {
      rating: 5,
      content: 'Excelente plataforma!',
    });

    expect(prisma.testimonial.create).toHaveBeenCalledWith({
      data: {
        userId: 'u-1',
        rating: 5,
        content: 'Excelente plataforma!',
        isVisible: true,
      },
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
    });
    expect(result).toEqual({
      id: 't-1',
      userId: 'u-1',
      userName: 'Raul',
      userAvatarUrl: 'https://example.com/a.png',
      content: 'Excelente plataforma!',
      rating: 5,
      isFeatured: false,
      isVisible: true,
      createdAt,
    });
  });
});
