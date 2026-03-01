import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'; // 1. Import Throttler
import { APP_GUARD } from '@nestjs/core'; // 2. Import APP_GUARD
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
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
import { Request, Response, NextFunction } from 'express';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 3. Configure the Rate Limit: 10 requests every 60 seconds per IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrometheusModule.register({
      path: '/metrics',
    }),
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
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: Request, res: Response, next: NextFunction) => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
          res.set('WWW-Authenticate', 'Basic realm="Metrics"');
          return res.status(401).send('Authentication required');
        }

        const b64auth = authHeader.split(' ')[1];
        const [user, pass] = Buffer.from(b64auth, 'base64')
          .toString()
          .split(':');

        if (
          user &&
          pass &&
          user === process.env.METRICS_USER &&
          pass === process.env.METRICS_PASS
        ) {
          return next();
        } else {
          res.set('WWW-Authenticate', 'Basic realm="Metrics"');
          return res.status(401).send('Authentication required');
        }
      })
      .forRoutes('*metrics*');
  }
}
