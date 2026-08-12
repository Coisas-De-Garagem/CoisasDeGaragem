import {
  Controller,
  Post,
  Headers,
  Req,
  Res,
  HttpStatus,
  UnauthorizedException,
  Logger,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseStatus } from '@prisma/client';
import * as crypto from 'crypto';
import { AbacatePayService, AbacatePayResponse } from './abacatepay.service';
import { getErrorMessage } from '../common/error.util';

/** Payload delivered by an Abacate Pay webhook. */
interface AbacatePayWebhook {
  event: string;
  id: string;
  data: {
    externalId: string;
    id: string;
    status: string;
  };
}

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  private readonly webhookSecret: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private abacatePayService: AbacatePayService,
  ) {
    this.webhookSecret =
      this.configService.get<string>('ABACATEPAY_WEBHOOK_SECRET') || '';
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-webhook-signature') signature: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!signature) {
      this.logger.warn('Requisição de webhook sem header x-webhook-signature');
      throw new UnauthorizedException('Missing signature header');
    }

    const rawBody = req.rawBody;
    if (!rawBody) {
      this.logger.warn('Requisição de webhook com corpo vazio');
      throw new UnauthorizedException('Empty body');
    }

    // Calcular HMAC-SHA256 usando o rawBody
    const computedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawBody)
      .digest('hex');

    // Comparação segura contra timing attacks
    try {
      const sigBuffer = Buffer.from(signature, 'hex');
      const compSigBuffer = Buffer.from(computedSignature, 'hex');

      if (
        sigBuffer.length !== compSigBuffer.length ||
        !crypto.timingSafeEqual(sigBuffer, compSigBuffer)
      ) {
        this.logger.error('Assinatura do webhook inválida');
        throw new UnauthorizedException('Invalid signature');
      }
    } catch (error) {
      this.logger.error(
        `Erro ao validar assinatura: ${getErrorMessage(error)}`,
      );
      throw new UnauthorizedException('Invalid signature verification');
    }

    // Parse do payload
    let payload: AbacatePayWebhook;
    try {
      payload = JSON.parse(rawBody.toString('utf8')) as AbacatePayWebhook;
    } catch {
      this.logger.error('Erro ao analisar JSON do webhook');
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid JSON' });
    }

    const event = payload.event;
    const data = payload.data;

    this.logger.log(`Webhook recebido: evento=${event}, id=${payload.id}`);

    if (event === 'checkout.completed' || event === 'transparent.completed') {
      const purchaseId = data.externalId;
      // Abacate Pay status can be 'PAID' or 'COMPLETED'
      const status = data.status;

      if (status === 'PAID' || status === 'COMPLETED' || !status) {
        this.logger.log(`Confirmando pagamento para a compra ${purchaseId}`);
        await this.prisma.$transaction(async (prisma) => {
          const purchase = await prisma.purchase.findUnique({
            where: { id: purchaseId },
          });

          if (!purchase) {
            this.logger.error(`Compra ${purchaseId} não encontrada no banco`);
            return;
          }

          if (purchase.status === PurchaseStatus.PENDING) {
            // Atualizar status da compra
            await prisma.purchase.update({
              where: { id: purchaseId },
              data: { status: PurchaseStatus.COMPLETED },
            });

            // Atualizar status do produto
            await prisma.product.update({
              where: { id: purchase.productId },
              data: {
                isAvailable: false,
                isReserved: false,
                isSold: true,
              },
            });
            this.logger.log(`Compra ${purchaseId} concluída com sucesso.`);
          } else {
            this.logger.warn(
              `Compra ${purchaseId} já possui status ${purchase.status}. Nenhuma ação tomada.`,
            );
          }
        });
      }
    } else if (
      event === 'checkout.lost' ||
      event === 'checkout.refunded' ||
      event === 'transparent.refunded'
    ) {
      const purchaseId = data.externalId;
      this.logger.log(
        `Cancelando/Expirando a compra ${purchaseId} devido ao evento ${event}`,
      );
      await this.prisma.$transaction(async (prisma) => {
        const purchase = await prisma.purchase.findUnique({
          where: { id: purchaseId },
        });

        if (!purchase) {
          this.logger.error(
            `Compra ${purchaseId} não encontrada para cancelamento`,
          );
          return;
        }

        if (
          purchase.status === PurchaseStatus.PENDING ||
          (event === 'checkout.refunded' &&
            purchase.status === PurchaseStatus.COMPLETED)
        ) {
          const newStatus =
            event === 'checkout.refunded'
              ? PurchaseStatus.REFUNDED
              : PurchaseStatus.CANCELLED;

          await prisma.purchase.update({
            where: { id: purchaseId },
            data: { status: newStatus },
          });

          await prisma.product.update({
            where: { id: purchase.productId },
            data: {
              isAvailable: true,
              isReserved: false,
              isSold: false,
            },
          });
          this.logger.log(
            `Compra ${purchaseId} atualizada para ${newStatus} e produto reaberto.`,
          );
        }
      });
    }

    return res.status(HttpStatus.OK).json({ received: true });
  }

  @Post('simulate')
  async simulatePayment(
    @Body('chargeId') chargeId: string,
    @Body('purchaseId') purchaseId?: string,
  ) {
    if (!chargeId) {
      throw new BadRequestException('Missing chargeId');
    }

    let result: AbacatePayResponse<unknown> | null = null;
    let apiError: string | null = null;

    try {
      // Abacate Pay's simulate-payment API is only for transparent Pix charges (typically start with pix_char_)
      // If it's a checkout session ID (starts with bill_), we don't call the API to prevent gateway crash
      if (chargeId && !chargeId.startsWith('bill_')) {
        result = await this.abacatePayService.simulateTransparentPix(chargeId);
      }
    } catch (err) {
      apiError = getErrorMessage(err);
      this.logger.warn(
        `Gateway simulation error: ${apiError}. Proceeding with local sync.`,
      );
    }

    if (purchaseId) {
      this.logger.log(
        `[Dev Mode] Sincronizando localmente a compra ${purchaseId} após simulação.`,
      );
      await this.prisma.$transaction(async (prisma) => {
        const purchase = await prisma.purchase.findUnique({
          where: { id: purchaseId },
        });

        if (purchase && purchase.status === PurchaseStatus.PENDING) {
          await prisma.purchase.update({
            where: { id: purchaseId },
            data: { status: PurchaseStatus.COMPLETED },
          });

          await prisma.product.update({
            where: { id: purchase.productId },
            data: {
              isAvailable: false,
              isReserved: false,
              isSold: true,
            },
          });
          this.logger.log(
            `[Dev Mode] Compra ${purchaseId} concluída localmente com sucesso.`,
          );
        }
      });
    }

    if (!result && apiError && !purchaseId) {
      throw new BadRequestException(`Erro ao simular no gateway: ${apiError}`);
    }

    return result || { success: true, localSync: true };
  }
}
