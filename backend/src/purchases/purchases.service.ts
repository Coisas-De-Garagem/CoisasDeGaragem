import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseStatus } from '@prisma/client';
import { AbacatePayService } from '../payments/abacatepay.service';

@Injectable()
export class PurchasesService {
  constructor(
    private prisma: PrismaService,
    private abacatePayService: AbacatePayService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto, buyerId: string) {
    await this.cleanExpiredPurchases();

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

      // Mark product as reserved (unavailable for others)
      await prisma.product.update({
        where: { id: product.id },
        data: { isAvailable: false, isReserved: true },
      });

      let paymentUrl: string | null = null;
      let qrCode: string | null = null;
      let pixKey: string | null = null;
      let chargeId: string | null = null;
      const expiresInSeconds = 60; // Checkout expires in 60 seconds (for testing)

      // Handle Abacate Pay integration for digital payment methods (PIX, CARD)
      if (createPurchaseDto.paymentMethod === 'PIX' || createPurchaseDto.paymentMethod === 'CARD') {
        const buyer = await prisma.user.findUnique({
          where: { id: buyerId },
        });

        if (!buyer) {
          throw new NotFoundException('Buyer not found');
        }

        // 1. Get or create customer in Abacate Pay
        const customerId = await this.abacatePayService.getOrCreateCustomer({
          email: buyer.email,
          name: buyer.name,
          phone: buyer.phone || undefined,
        });

        // 2. Create product in Abacate Pay
        const priceInCents = Math.round(Number(product.price) * 100);
        const apProductId = await this.abacatePayService.createProduct({
          externalId: purchase.id, // Use purchase ID to avoid duplicate product conflicts
          name: product.name,
          description: product.description,
          priceInCents,
          currency: product.currency,
        });

        if (createPurchaseDto.paymentMethod === 'PIX') {
          // Use transparent checkout for PIX to get QR code and Pix copy/paste key
          const transparentPix = await this.abacatePayService.createTransparentPix({
            purchaseId: purchase.id,
            amountInCents: priceInCents,
            description: `Compra do produto ${product.name}`,
            buyer: {
              email: buyer.email,
              name: buyer.name,
              phone: buyer.phone || undefined,
            },
            expiresInSeconds,
          });
          qrCode = transparentPix.brCodeBase64;
          pixKey = transparentPix.brCode;
          chargeId = transparentPix.chargeId;
        } else {
          // CARD
          // 3. Create checkout session
          const checkout = await this.abacatePayService.createCheckout({
            customerId,
            purchaseId: purchase.id,
            apProductId,
            paymentMethod: createPurchaseDto.paymentMethod,
          });
          paymentUrl = checkout.url;
          chargeId = checkout.id;
        }
      }

      return {
        ...purchase,
        paymentUrl,
        qrCode,
        pixKey,
        chargeId,
        expiresInSeconds,
      };
    });
  }

  async findAllByBuyer(
    buyerId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { buyerId };
    if (status) {
      where.status = status;
    }

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        include: {
          product: true,
          seller: { select: { name: true, email: true } },
        },
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

  async findAllBySeller(
    sellerId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: any = { sellerId };
    if (status) {
      where.status = status;
    }

    const [purchases, total] = await Promise.all([
      this.prisma.purchase.findMany({
        where,
        include: {
          product: true,
          buyer: { select: { name: true, email: true } },
        },
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
    await this.cleanExpiredPurchases();

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

  async cleanExpiredPurchases() {
    const expireTimeSeconds = 60; // Checkout expires in 60 seconds
    const expirationDate = new Date(Date.now() - expireTimeSeconds * 1000);

    const expiredPurchases = await this.prisma.purchase.findMany({
      where: {
        status: PurchaseStatus.PENDING,
        createdAt: { lt: expirationDate },
        paymentMethod: { in: ['PIX', 'CARD'] },
      },
    });

    if (expiredPurchases.length === 0) return;

    await this.prisma.$transaction(async (prisma) => {
      for (const purchase of expiredPurchases) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: PurchaseStatus.CANCELLED },
        });

        await prisma.product.update({
          where: { id: purchase.productId },
          data: {
            isAvailable: true,
            isReserved: false,
            isSold: false,
          },
        });
      }
    });
  }
}
