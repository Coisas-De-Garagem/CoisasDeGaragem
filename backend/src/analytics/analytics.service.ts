import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getSellerAnalytics(sellerId: string) {
        const totalSales = await this.prisma.purchase.count({
            where: {
                sellerId,
                status: PurchaseStatus.COMPLETED,
            },
        });

        const revenueResult = await this.prisma.purchase.aggregate({
            where: {
                sellerId,
                status: PurchaseStatus.COMPLETED,
            },
            _sum: {
                price: true,
            },
        });

        const totalRevenue = revenueResult._sum.price ? Number(revenueResult._sum.price) : 0;

        const productsListed = await this.prisma.product.count({
            where: { sellerId },
        });

        const productsValueResult = await this.prisma.product.aggregate({
            where: { sellerId },
            _sum: {
                price: true,
            },
        });

        const totalListingsValue = productsValueResult._sum.price ? Number(productsValueResult._sum.price) : 0;

        const uniqueBuyersResult = await this.prisma.purchase.groupBy({
            by: ['buyerId'],
            where: {
                sellerId,
                status: PurchaseStatus.COMPLETED,
            },
        });

        const uniqueBuyers = uniqueBuyersResult.length;

        const averagePrice = totalSales > 0 ? totalRevenue / totalSales : 0;

        return {
            totalSales,
            totalRevenue,
            averagePrice,
            productsSold: totalSales,
            productsListed,
            totalListingsValue,
            uniqueBuyers,
        };
    }
}
