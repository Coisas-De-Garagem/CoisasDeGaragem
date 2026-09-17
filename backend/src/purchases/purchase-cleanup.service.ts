import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseStatus } from '@prisma/client';
import { getErrorMessage } from '../common/error.util';

/**
 * Serviço responsável pelo cancelamento de compras PIX/CARD expiradas
 * e liberação de produtos de volta ao catálogo.
 *
 * NOTA PARA BANCO SERVERLESS (NEON / SUPABASE):
 * Polling contínuo com setInterval a cada 60s consome 100% da cota de Compute Hours (CU)
 * do Neon em poucos dias porque impede o banco de hibernar (auto-suspend após 5 min).
 *
 * Por padrão, o cancelamento funciona sob demanda (lazy) e através de agendamento
 * pontual em memória (setTimeout) por compra criada, garantindo ZERO queries quando
 * não há usuários na aplicação.
 */
@Injectable()
export class PurchaseCleanupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PurchaseCleanupService.name);

  private readonly intervalMs =
    Number(process.env.PURCHASE_CLEANUP_INTERVAL_MS) || 60_000;
  private readonly expirationMs =
    Number(process.env.PURCHASE_EXPIRATION_MS) || 60_000;

  constructor(private prisma: PrismaService) {}

  async onApplicationBootstrap() {
    // Evita executar durante a suíte de testes (e2e/unit).
    if (process.env.NODE_ENV === 'test') return;

    // Executa UMA ÚNICA VEZ no startup para recuperar compras que expiraram durante reinício/deploy
    try {
      await this.cleanupExpiredPurchases();
    } catch (err) {
      this.logger.error(
        `Erro na varredura inicial de compras expiradas: ${getErrorMessage(err)}`,
      );
    }

    if (process.env.ENABLE_BACKGROUND_CLEANUP === 'true') {
      setInterval(() => {
        void this.cleanupExpiredPurchases();
      }, this.intervalMs);

      this.logger.debug(
        `Serviço de limpeza periódica em background ativo (intervalo=${this.intervalMs}ms, expiração=${this.expirationMs}ms).`,
      );
    } else {
      this.logger.log(
        'Limpeza periódica em background desativada por padrão para preservação de cota serverless (Neon). Utilizando expiração pontual por evento e sob demanda.',
      );
    }
  }

  /**
   * Agenda o cancelamento pontual de uma compra específica após o tempo de expiração.
   * Não realiza polling no banco: roda apenas uma vez para o ID agendado.
   */
  schedulePurchaseTimeout(
    purchaseId: string,
    delayMs: number = this.expirationMs,
  ) {
    setTimeout(async () => {
      await this.cancelPurchaseIfPending(purchaseId);
    }, delayMs);
  }

  /**
   * Cancela uma compra específica caso ela ainda esteja com status PENDING após o timeout.
   */
  async cancelPurchaseIfPending(purchaseId: string) {
    try {
      await this.prisma.$transaction(async (prisma) => {
        const p = await prisma.purchase.findUnique({
          where: { id: purchaseId },
        });

        // Cancela apenas se ainda estiver pendente (não pago nem cancelado)
        if (p && p.status === PurchaseStatus.PENDING) {
          await prisma.purchase.update({
            where: { id: p.id },
            data: { status: PurchaseStatus.CANCELLED },
          });

          await prisma.product.update({
            where: { id: p.productId },
            data: {
              isAvailable: true,
              isReserved: false,
              isSold: false,
            },
          });
          this.logger.log(
            `Compra ${p.id} expirada e cancelada via timeout. Produto ${p.productId} liberado de volta ao catálogo.`,
          );
        }
      });
    } catch (error) {
      this.logger.error(
        `Erro ao cancelar compra ${purchaseId} expirada: ${getErrorMessage(error)}`,
      );
    }
  }

  /**
   * Varredura sob demanda para cancelar qualquer compra expirada em lote.
   */
  async cleanupExpiredPurchases() {
    try {
      const expirationLimit = new Date(Date.now() - this.expirationMs);

      const expiredPurchases = await this.prisma.purchase.findMany({
        where: {
          status: PurchaseStatus.PENDING,
          paymentMethod: { in: ['PIX', 'CARD'] },
          createdAt: { lt: expirationLimit },
        },
      });

      if (expiredPurchases.length === 0) {
        return;
      }

      this.logger.log(
        `Encontradas ${expiredPurchases.length} compras digitais expiradas. Iniciando liberação...`,
      );

      for (const purchase of expiredPurchases) {
        await this.prisma.$transaction(async (prisma) => {
          const p = await prisma.purchase.findUnique({
            where: { id: purchase.id },
          });

          // Verifica novamente o status dentro da transação.
          if (p && p.status === PurchaseStatus.PENDING) {
            await prisma.purchase.update({
              where: { id: p.id },
              data: { status: PurchaseStatus.CANCELLED },
            });

            await prisma.product.update({
              where: { id: p.productId },
              data: {
                isAvailable: true,
                isReserved: false,
                isSold: false,
              },
            });
            this.logger.log(
              `Compra ${p.id} cancelada. Produto ${p.productId} liberado de volta ao catálogo.`,
            );
          }
        });
      }
    } catch (error) {
      this.logger.error(
        `Erro ao executar varredura de limpeza de reservas: ${getErrorMessage(error)}`,
      );
    }
  }
}
