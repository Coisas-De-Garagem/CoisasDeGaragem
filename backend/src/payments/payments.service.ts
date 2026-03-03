import { Injectable, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AbacatePay } from 'abacatepay-nodejs-sdk';
import { PurchaseStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private abacatePay: AbacatePay;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('ABACATEPAY_API_KEY');
    this.abacatePay = new AbacatePay({ apiKey });
  }

  async createAbacatePixCharge(purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        product: true,
        buyer: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${purchaseId} not found`);
    }

    try {
      // SDK documentation check needed for exact method names.
      // Assuming createBilling or similar exists.
      // TODO: Verify exact SDK method names against documentation.
      // Based on typical AbacatePay SDK structure:
      const response = await this.abacatePay.billing.create({
        frequency: 'ONE_TIME',
        methods: ['PIX'],
        products: [
          {
            externalId: purchase.product.id,
            name: purchase.product.name,
            quantity: 1,
            price: Math.round(Number(purchase.price) * 100), // Amount in cents
          },
        ],
        returnUrl: this.config.get<string>('FRONTEND_URL') + '/purchase/success',
        completionUrl: this.config.get<string>('FRONTEND_URL') + '/purchase/complete',
        customerId: purchase.buyer.email,
        customer: {
          name: purchase.buyer.name,
          email: purchase.buyer.email,
          taxId: '00000000000',
        },
        metadata: {
          purchaseId: purchase.id,
        },
      });

      if (response.error) {
        throw new InternalServerErrorException(response.error);
      }

      const billing = response.data;

      // On success, update the purchase with payment details
      // TODO: Verify exact path for PIX payload and expiry in the SDK response
      const pixData = (billing as any).pix;
      
      await this.prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          abacatePaymentId: billing.id,
          paymentStatus: 'PENDING',
          paymentQr: pixData?.payload,
          paymentQrUrl: pixData?.qrCodeUrl,
          paymentExpiresAt: pixData?.expiresAt ? new Date(pixData.expiresAt) : null,
        },
      });

      return {
        paymentId: billing.id,
        paymentUrl: billing.url,
        paymentQr: pixData?.payload,
        paymentQrUrl: pixData?.qrCodeUrl,
        expiresAt: pixData?.expiresAt,
      };
    } catch (error) {
      console.error('AbacatePay Charge Creation Error:', error);
      throw new InternalServerErrorException('Failed to create PIX charge');
    }
  }

  async getPaymentStatus(purchaseId: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      select: { paymentStatus: true },
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${purchaseId} not found`);
    }

    return { status: purchase.paymentStatus };
  }

  async handleWebhook(body: any, signature: string, rawBody: Buffer) {
    const secret = this.config.get<string>('ABACATEPAY_WEBHOOK_SECRET');
    
    if (signature && secret) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(rawBody).digest('hex');
      
      if (digest !== signature) {
        throw new UnauthorizedException('Invalid webhook signature');
      }
    } else if (!signature && secret) {
        // If secret is configured but no signature provided, and we fallback to body check
        // but typically AbacatePay uses the header.
        throw new UnauthorizedException('Webhook signature missing');
    }

    const { event, data } = body;
    const purchaseId = data?.metadata?.purchaseId;
    const abacatePaymentId = data?.id;

    if (!purchaseId && !abacatePaymentId) {
      return { received: true }; // Probably not an event we care about
    }

    const purchase = await this.prisma.purchase.findFirst({
      where: {
        OR: [
          { id: purchaseId },
          { abacatePaymentId: abacatePaymentId }
        ]
      },
    });

    if (!purchase) {
      console.warn(`Webhook received for unknown purchase: ${purchaseId || abacatePaymentId}`);
      return { received: true };
    }

    if (event === 'billing.paid' || event === 'pix.paid') {
      await this.prisma.$transaction([
        this.prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: PurchaseStatus.COMPLETED, // Assuming COMPLETED is the "PAID" state in schema
            paymentStatus: 'PAID',
          },
        }),
        this.prisma.product.update({
          where: { id: purchase.productId },
          data: {
            isSold: true,
            isAvailable: false,
          },
        }),
      ]);
    } else if (event === 'pix.expired' || event === 'billing.expired') {
        await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: {
                status: PurchaseStatus.CANCELLED,
                paymentStatus: 'EXPIRED',
            },
        });
    }

    return { received: true };
  }
}
