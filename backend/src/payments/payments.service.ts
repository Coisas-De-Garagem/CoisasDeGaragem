import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { AbacatePay } from 'abacatepay-nodejs-sdk';

@Injectable()
export class PaymentsService {
  private abacatePay: AbacatePay;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('ABACATEPAY_API_KEY');
    // TODO: Verify if ABACATEPAY_BASE_URL is needed or if SDK uses a default.
    // The SDK might not take a base URL in the constructor if it's fixed.
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
      const billing = await this.abacatePay.billing.create({
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
        customerId: purchase.buyer.email, // Or use a dedicated customer ID mapping
        customer: {
          name: purchase.buyer.name,
          email: purchase.buyer.email,
          taxId: '00000000000', // AbacatePay might require a taxId (CPF/CNPJ)
        },
        metadata: {
          purchaseId: purchase.id,
        },
      });

      // On success, update the purchase with payment details
      // Note: abacatePay SDK 'billing.create' response structure needs verification.
      // Assuming 'billing.data' or similar contains the ID and PIX info.
      const updatedPurchase = await this.prisma.purchase.update({
        where: { id: purchaseId },
        data: {
          abacatePaymentId: billing.id,
          // paymentQr: billing.pix?.payload, // TODO: verify path
          // paymentQrUrl: billing.pix?.url, // TODO: verify path
          paymentStatus: 'PENDING',
          // paymentExpiresAt: new Date(billing.expiresAt), // TODO: verify path
        },
      });

      return {
        paymentId: billing.id,
        paymentUrl: billing.url, // URL for the checkout page
        // paymentQr: billing.pix?.payload,
        // paymentQrUrl: billing.pix?.url,
        // expiresAt: billing.expiresAt,
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
}
