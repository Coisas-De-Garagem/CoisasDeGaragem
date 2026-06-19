import { Module } from '@nestjs/common';
import { AbacatePayService } from './abacatepay.service';
import { PaymentsController } from './payments.controller';

@Module({
  controllers: [PaymentsController],
  providers: [AbacatePayService],
  exports: [AbacatePayService],
})
export class PaymentsModule {}
