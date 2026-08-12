import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('seller')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter analytics do vendedor',
    description:
      'Retorna métricas e estatísticas de vendas do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics do vendedor',
    schema: {
      example: {
        totalProducts: 15,
        activeProducts: 12,
        soldProducts: 3,
        totalSales: 4500.0,
        totalRevenue: 4500.0,
        averageSalePrice: 1500.0,
        salesByMonth: [
          { month: '2024-01', sales: 2, revenue: 3000.0 },
          { month: '2024-02', sales: 1, revenue: 1500.0 },
        ],
        salesByCategory: [
          { category: 'Esportes', sales: 2, revenue: 3000.0 },
          { category: 'Eletrônicos', sales: 1, revenue: 1500.0 },
        ],
        recentSales: [
          {
            id: 'purchase-id',
            productId: 'product-id',
            price: 1500.0,
            status: 'COMPLETED',
            purchaseDate: '2024-01-15T10:30:00.000Z',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  getSellerAnalytics(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getSellerAnalytics(user.userId);
  }
}
