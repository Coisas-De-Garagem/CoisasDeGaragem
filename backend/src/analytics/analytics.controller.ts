import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('analytics')
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get('seller')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.USER)
    getSellerAnalytics(@CurrentUser() user: any) {
        return this.analyticsService.getSellerAnalytics(user.userId);
    }
}
