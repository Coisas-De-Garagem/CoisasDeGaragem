import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth-user.interface';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('public')
  @ApiOperation({ summary: 'Get public reviews as testimonials' })
  getPublicReviews() {
    return this.reviewsService.getPublicTestimonials();
  }

  @Post('testimonials')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new testimonial (platform review)' })
  createTestimonial(
    @Body() data: { rating: number; content: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviewsService.createTestimonial(user.userId, data);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review for a purchase' })
  create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reviewsService.create(createReviewDto, user.userId);
  }

  @Get('pending')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pending reviews for the current user' })
  getPendingReviews(@CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.getPendingReviews(user.userId);
  }
}
