import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

@Module({
  controllers: [PurchasesController],
  providers: [PurchasesService]
})
export class PurchasesModule {}
