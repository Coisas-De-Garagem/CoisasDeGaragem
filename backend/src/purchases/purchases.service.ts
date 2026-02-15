import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseStatus } from '@prisma/client';

@Injectable()
export class PurchasesService {
    constructor(private prisma: PrismaService) { }

    async create(createPurchaseDto: CreatePurchaseDto, buyerId: string) {
        const product = await this.prisma.product.findUnique({
            where: { id: createPurchaseDto.productId },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (!product.isAvailable) {
            throw new BadRequestException('Product is not available');
        }

        if (product.sellerId === buyerId) {
            throw new BadRequestException('Cannot buy your own product');
        }

        // Start transaction
        return this.prisma.$transaction(async (prisma) => {
            // Create purchase
            const purchase = await prisma.purchase.create({
                data: {
                    productId: product.id,
                    buyerId,
                    sellerId: product.sellerId,
                    price: product.price,
                    currency: product.currency,
                    paymentMethod: createPurchaseDto.paymentMethod,
                    notes: createPurchaseDto.notes,
                    status: PurchaseStatus.PENDING,
                },
            });

            // Mark product not available
            await prisma.product.update({
                where: { id: product.id },
                data: { isAvailable: false },
            });

            return purchase;
        });
    }

    async findAllByBuyer(buyerId: string, page: number = 1, limit: number = 20, status?: string) {
        const skip = (page - 1) * limit;
        const where: any = { buyerId };
        if (status) {
            where.status = status;
        }

        const [purchases, total] = await Promise.all([
            this.prisma.purchase.findMany({
                where,
                include: { product: true, seller: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.purchase.count({ where }),
        ]);

        return {
            purchases,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findAllBySeller(sellerId: string, page: number = 1, limit: number = 20, status?: string) {
        const skip = (page - 1) * limit;
        const where: any = { sellerId };
        if (status) {
            where.status = status;
        }

        const [purchases, total] = await Promise.all([
            this.prisma.purchase.findMany({
                where,
                include: { product: true, buyer: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.purchase.count({ where }),
        ]);

        return {
            purchases,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string, userId: string) {
        const purchase = await this.prisma.purchase.findUnique({
            where: { id },
            include: { product: true },
        });
        if (!purchase) throw new NotFoundException('Purchase not found');

        if (purchase.buyerId !== userId && purchase.sellerId !== userId) {
            // Forbidden
            throw new NotFoundException('Purchase not found'); // hide it
        }
        return purchase;
    }
}
