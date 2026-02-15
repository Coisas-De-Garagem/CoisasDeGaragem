import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PurchasesModule } from './purchases/purchases.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, UsersModule, AuthModule, ProductsModule, AnalyticsModule, PurchasesModule, QrCodesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
