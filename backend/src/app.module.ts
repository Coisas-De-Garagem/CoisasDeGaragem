import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // 1. Import Throttler
import { APP_GUARD } from '@nestjs/core'; // 2. Import APP_GUARD
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PurchasesModule } from './purchases/purchases.module';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 3. Configure the Rate Limit: 10 requests every 60 seconds per IP
    ThrottlerModule.forRoot([{
      ttl: 60000, 
      limit: 10,
    }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    AnalyticsModule,
    PurchasesModule,
    QrCodesModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 4. Register the Guard globally
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
