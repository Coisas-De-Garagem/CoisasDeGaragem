import { Module } from '@nestjs/common';
import { QrCodesController } from './qr-codes.controller';

@Module({
  controllers: [QrCodesController]
})
export class QrCodesModule {}
