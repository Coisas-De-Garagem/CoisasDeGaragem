import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { PaymentsModule } from '../payments/payments.module';
import { PurchaseCleanupService } from './purchase-cleanup.service';

@Module({
  imports: [PaymentsModule],
  controllers: [PurchasesController],
  providers: [PurchasesService, PurchaseCleanupService],
})
export class PurchasesModule {}
