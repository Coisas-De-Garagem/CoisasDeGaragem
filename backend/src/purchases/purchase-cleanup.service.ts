import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseStatus } from '@prisma/client';
import { getErrorMessage } from '../common/error.util';

/**
 * Cancela compras PIX/CARD que ficaram PENDING além do prazo de expiração,
 * liberando o produto de volta ao catálogo.
 *
 * Configuração via variáveis de ambiente:
 *  - PURCHASE_CLEANUP_INTERVAL_MS: intervalo entre varreduras (default 60s).
 *  - PURCHASE_EXPIRATION_MS:       tempo para uma compra expirar (default 60s).
 *
 * Em desenvolvimento é comum reduzir esses valores para testar manualmente;
 * em produção, mantenha-os em valores razoáveis (ex.: 60s de intervalo,
 * 15min de expiração).
 */
@Injectable()
export class PurchaseCleanupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PurchaseCleanupService.name);

  private readonly intervalMs =
    Number(process.env.PURCHASE_CLEANUP_INTERVAL_MS) || 60_000;
  private readonly expirationMs =
    Number(process.env.PURCHASE_EXPIRATION_MS) || 60_000;

  constructor(private prisma: PrismaService) {}

  onApplicationBootstrap() {
    // Evita registrar o intervalo durante a suíte de testes (e2e/unit).
    if (process.env.NODE_ENV === 'test') return;

    setInterval(() => {
      void this.cleanupExpiredPurchases();
    }, this.intervalMs);

    this.logger.debug(
      `Serviço de limpeza de reservas inicializado (intervalo=${this.intervalMs}ms, expiração=${this.expirationMs}ms).`,
    );
  }

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
