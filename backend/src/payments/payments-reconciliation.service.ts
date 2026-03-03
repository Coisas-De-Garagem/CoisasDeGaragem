import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { PurchaseStatus } from '@prisma/client';
import AbacatePay from 'abacatepay-nodejs-sdk';

// Use require as a fallback for the AbacatePay SDK
const AbacatePaySDK = require('abacatepay-nodejs-sdk');

@Injectable()
export class PaymentsReconciliationService {
  private readonly logger = new Logger(PaymentsReconciliationService.name);
  private abacatePay: any;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('ABACATEPAY_API_KEY') || '';
    // Use the fallback if the default import doesn't act like a function
    this.abacatePay = typeof AbacatePay === 'function' ? AbacatePay(apiKey) : AbacatePaySDK(apiKey);
  }

  // Run every 30 minutes to check for pending purchases older than 30 minutes
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleReconciliation() {
    this.logger.log('Starting AbacatePay PIX reconciliation job...');

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    try {
      // 1. Query for purchases with paymentStatus = 'PENDING' older than 30 minutes
      const pendingPurchases = await this.prisma.purchase.findMany({
        where: {
          paymentStatus: 'PENDING',
          abacatePaymentId: { not: null },
          purchaseDate: { lt: thirtyMinutesAgo },
        },
      });

      if (pendingPurchases.length === 0) {
        this.logger.log('No pending AbacatePay purchases older than 30 minutes found.');
        return;
      }

      this.logger.log(`Found ${pendingPurchases.length} pending purchases to reconcile.`);

      // 2. Get list of billings from AbacatePay
      // Since the SDK doesn't expose a specific billing.get(id) in its types, we use list()
      const response = await this.abacatePay.billing.list();

      if (response.error) {
        this.logger.error(`Failed to fetch billings from AbacatePay: ${response.error}`);
        return;
      }

      const billings = response.data || [];

      // 3. Reconcile statuses
      for (const purchase of pendingPurchases) {
        const remoteBilling = billings.find((b: any) => b.id === purchase.abacatePaymentId);

        if (!remoteBilling) {
          this.logger.warn(`Billing ID ${purchase.abacatePaymentId} not found in AbacatePay list.`);
          continue;
        }

        if (remoteBilling.status === 'PAID') {
          this.logger.warn(`DISCREPANCY ALERT: Purchase ${purchase.id} is PAID in AbacatePay but PENDING locally. The webhook might have failed. Updating local DB.`);
          
          await this.prisma.$transaction([
            this.prisma.purchase.update({
              where: { id: purchase.id },
              data: {
                status: PurchaseStatus.COMPLETED,
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
          this.logger.log(`Purchase ${purchase.id} reconciled as PAID.`);
          
        } else if (remoteBilling.status === 'EXPIRED' || remoteBilling.status === 'CANCELLED') {
          this.logger.log(`Purchase ${purchase.id} is ${remoteBilling.status} remotely. Updating local status.`);
          
          await this.prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              status: PurchaseStatus.CANCELLED,
              paymentStatus: remoteBilling.status,
            },
          });
          this.logger.log(`Purchase ${purchase.id} reconciled as ${remoteBilling.status}.`);
        }
      }
    } catch (error) {
      this.logger.error('Error during payment reconciliation job', error);
    }
  }
}
