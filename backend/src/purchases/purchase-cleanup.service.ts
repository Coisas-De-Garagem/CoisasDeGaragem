import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PurchaseStatus } from '@prisma/client';

@Injectable()
export class PurchaseCleanupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(PurchaseCleanupService.name);

  constructor(private prisma: PrismaService) {}

  onApplicationBootstrap() {
    // Run cleanup check every 10 seconds (for testing)
    setInterval(() => this.cleanupExpiredPurchases(), 10 * 1000);
    this.logger.log('Serviço de limpeza de reservas de checkout inicializado com sucesso.');
  }

  async cleanupExpiredPurchases() {
    try {
      this.logger.log('Iniciando varredura de reservas expiradas...');
      // 60 seconds ago (for testing)
      const expirationLimit = new Date(Date.now() - 60 * 1000);

      // Find all PENDING purchases created more than 15 minutes ago with digital payment methods
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

      this.logger.log(`Encontradas ${expiredPurchases.length} compras digitais expiradas. Iniciando liberação...`);

      for (const purchase of expiredPurchases) {
        await this.prisma.$transaction(async (prisma) => {
          const p = await prisma.purchase.findUnique({
            where: { id: purchase.id },
          });

          // Verify purchase status is still PENDING within the transaction context
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
            this.logger.log(`Compra ${p.id} cancelada. Produto ${p.productId} liberado de volta ao catálogo.`);
          }
        });
      }
    } catch (error) {
      this.logger.error(`Erro ao executar varredura de limpeza de reservas: ${error.message}`);
    }
  }
}
