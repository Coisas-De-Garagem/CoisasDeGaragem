import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(createReviewDto: CreateReviewDto, buyerId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: createReviewDto.purchaseId }
    });

    if (!purchase) {
      throw new NotFoundException('Purchase not found');
    }

    if (purchase.buyerId !== buyerId) {
      throw new BadRequestException('You can only review your own purchases');
    }
    
    if (purchase.status !== 'COMPLETED') {
      throw new BadRequestException('You can only review completed purchases');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { purchaseId: purchase.id }
    });

    if (existingReview) {
      throw new BadRequestException('Purchase has already been reviewed');
    }

    return this.prisma.review.create({
      data: {
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        purchaseId: purchase.id,
        buyerId: buyerId,
        sellerId: purchase.sellerId,
      }
    });
  }

  async getPendingReviews(userId: string) {
    // Find all completed purchases where user is buyer and no review exists
    const purchases = await this.prisma.purchase.findMany({
      where: {
        buyerId: userId,
        status: 'COMPLETED',
        review: null,
      },
      include: {
        product: true,
        seller: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    return purchases;
  }

  async getPublicTestimonials(limit: number = 9) {
    const testimonials = await this.prisma.testimonial.findMany({
      where: {
        isVisible: true
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, avatarUrl: true } }
      }
    });

    return testimonials.map(t => ({
      id: t.id,
      userId: t.userId,
      userName: t.user.name,
      userAvatarUrl: t.user.avatarUrl,
      content: t.content,
      rating: t.rating,
      isFeatured: t.isFeatured,
      isVisible: t.isVisible,
      createdAt: t.createdAt
    }));
  }

  async createTestimonial(userId: string, data: { rating: number; content: string }) {
    if (!data.content || data.content.trim() === '') {
      throw new BadRequestException('Content cannot be empty');
    }

    return this.prisma.testimonial.create({
      data: {
        userId,
        rating: data.rating,
        content: data.content,
      }
    });
  }
}
