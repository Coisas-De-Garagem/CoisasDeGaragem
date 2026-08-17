import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';

async function bootstrap() {
  const transports: any[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('CoisasDeGaragem', {
          colors: true,
          appName: true,
        }),
      ),
    }),
  ];

  if (process.env.LOKI_HOST) {
    transports.push(
      new LokiTransport({
        host: process.env.LOKI_HOST,
        basicAuth: `${process.env.LOKI_USER}:${process.env.LOKI_PASS}`,
        labels: { job: 'nestjs-logs' },
        format: winston.format.json(),
        replaceTimestamp: true,
        batching: false,
      }),
    );
  }

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({ transports }),
    rawBody: true,
  });

  const corsOriginRaw = process.env.CORS_ORIGIN ?? process.env.CORS_ORIGINS;
  const corsOrigins = corsOriginRaw
    ? corsOriginRaw
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean)
    : [];

  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Coisas de Garagem API')
    .setDescription(
      'API completa para marketplace de Garage Sales Coisas De Garagem. Permite usuários venderem e comprarem itens através de QR codes, com sistema de autenticação JWT, gestão de produtos, compras, analytics e etc.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
