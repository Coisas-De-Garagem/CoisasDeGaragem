import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto, sellerId: string) {
    const data: Prisma.GarageEventCreateInput = {
      ...createEventDto,
      seller: { connect: { id: sellerId } },
      qrCode: randomUUID(),
    };
    // Converte datas string (ISO) para Date, se presentes.
    if (createEventDto.startDate)
      data.startDate = new Date(createEventDto.startDate);
    if (createEventDto.endDate) data.endDate = new Date(createEventDto.endDate);

    return this.prisma.garageEvent.create({ data });
  }

  async findAllBySeller(sellerId: string) {
    const events = await this.prisma.garageEvent.findMany({
      where: { sellerId },
      include: {
        _count: { select: { products: true, visits: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Anexa contagens de forma plana para o frontend.
    return events.map(({ _count, ...event }) => ({
      ...event,
      productsCount: _count.products,
      visitsCount: _count.visits,
    }));
  }

  /** Detalhe privado (vendedor). Inclui produtos e contagem de visitas. */
  async findOne(id: string, sellerId: string) {
    const event = await this.prisma.garageEvent.findUnique({
      where: { id },
      include: {
        products: true,
        _count: { select: { products: true, visits: true } },
      },
    });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (event.sellerId !== sellerId) {
      throw new ForbiddenException('Você não tem acesso a este evento');
    }
    const { _count, ...rest } = event;
    return {
      ...rest,
      productsCount: _count.products,
      visitsCount: _count.visits,
    };
  }

  /** Dados públicos do evento + produtos vinculados (para a vitrine do comprador). */
  async getPublicEvent(id: string) {
    const event = await this.prisma.garageEvent.findUnique({
      where: { id },
      include: {
        products: {
          include: { seller: { select: { name: true } } },
        },
        seller: { select: { name: true, phone: true } },
      },
    });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
    return event;
  }

  async update(id: string, updateEventDto: UpdateEventDto, sellerId: string) {
    const event = await this.prisma.garageEvent.findUnique({ where: { id } });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (event.sellerId !== sellerId) {
      throw new ForbiddenException('Você não pode editar este evento');
    }

    const data: Prisma.GarageEventUpdateInput = { ...updateEventDto };
    if (updateEventDto.startDate)
      data.startDate = new Date(updateEventDto.startDate);
    if (updateEventDto.endDate) data.endDate = new Date(updateEventDto.endDate);

    return this.prisma.garageEvent.update({ where: { id }, data });
  }

  async remove(id: string, sellerId: string) {
    const event = await this.prisma.garageEvent.findUnique({
      where: { id },
      include: { products: { select: { id: true } } },
    });
    if (!event) {
      throw new NotFoundException('Evento não encontrado');
    }
    if (event.sellerId !== sellerId) {
      throw new ForbiddenException('Você não pode excluir este evento');
    }

    // Bloqueia exclusão se já houver vendas de produtos vinculados ao evento.
    if (event.products.length > 0) {
      const salesCount = await this.prisma.purchase.count({
        where: {
          productId: { in: event.products.map((p) => p.id) },
          status: 'COMPLETED',
        },
      });
      if (salesCount > 0) {
        throw new ConflictException(
          'Não é possível excluir um evento que já possui vendas vinculadas.',
        );
      }
    }

    // Desvincula produtos antes de excluir (limpa eventId).
    await this.prisma.product.updateMany({
      where: { eventId: id },
      data: { eventId: null },
    });

    return this.prisma.garageEvent.delete({ where: { id } });
  }

  // -----------------------------------------------------------------------
  // Vínculo de produtos
  // -----------------------------------------------------------------------

  async linkProduct(eventId: string, productId: string, sellerId: string) {
    const event = await this.prisma.garageEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    if (event.sellerId !== sellerId) {
      throw new ForbiddenException('Você não tem acesso a este evento');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (product.sellerId !== sellerId) {
      throw new ForbiddenException('Este produto não pertence a você');
    }
    // Regra: só produtos disponíveis podem ser vinculados.
    if (!product.isAvailable || product.isReserved || product.isSold) {
      throw new BadRequestException(
        'Apenas produtos disponíveis podem ser vinculados a um evento',
      );
    }
    // Regra: 1 produto = 1 evento por vez.
    if (product.eventId) {
      throw new ConflictException(
        'Este produto já está vinculado a outro evento',
      );
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { eventId },
    });
  }

  async unlinkProduct(eventId: string, productId: string, sellerId: string) {
    const event = await this.prisma.garageEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    if (event.sellerId !== sellerId) {
      throw new ForbiddenException('Você não tem acesso a este evento');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Produto não encontrado');
    if (product.eventId !== eventId) {
      throw new BadRequestException(
        'Este produto não está vinculado a este evento',
      );
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { eventId: null },
    });
  }

  // -----------------------------------------------------------------------
  // QR Code + Visitas
  // -----------------------------------------------------------------------

  getEventQrUrl(eventId: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const eventUrl = `${frontendUrl}/event/${eventId}`;
    return {
      url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`,
      eventUrl,
    };
  }

  async getEventQr(eventId: string, sellerId: string) {
    const event = await this.prisma.garageEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    if (event.sellerId !== sellerId) {
      throw new ForbiddenException('Você não tem acesso a este evento');
    }
    return {
      ...this.getEventQrUrl(eventId),
      code: event.qrCode,
    };
  }

  async recordVisit(eventId: string) {
    const event = await this.prisma.garageEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    await this.prisma.eventVisit.create({ data: { eventId } });
    return { success: true };
  }

  // -----------------------------------------------------------------------
  // Insights / Relatórios
  // -----------------------------------------------------------------------

  async getInsights(eventId: string, sellerId: string) {
    const event = await this.prisma.garageEvent.findUnique({
      where: { id: eventId },
      include: { products: { select: { id: true } } },
    });
    if (!event) throw new NotFoundException('Evento não encontrado');
    if (event.sellerId !== sellerId) {
      throw new ForbiddenException('Você não tem acesso a este evento');
    }

    const productIds = event.products.map((p) => p.id);
    const listedCount = productIds.length;

    // Compras dos produtos do evento.
    const purchases = await this.prisma.purchase.findMany({
      where: { productId: { in: productIds } },
      include: { product: { select: { id: true, name: true } } },
    });

    const completed = purchases.filter((p) => p.status === 'COMPLETED');
    const salesCount = completed.length;
    const totalRevenue = completed.reduce((sum, p) => sum + Number(p.price), 0);
    const ticketAverage = salesCount > 0 ? totalRevenue / salesCount : 0;
    const productsSold = new Set(completed.map((p) => p.productId)).size;
    const conversionRate =
      listedCount > 0 ? (productsSold / listedCount) * 100 : 0;

    // Ranking de produtos (por quantidade vendida).
    const rankingMap = new Map<
      string,
      { productId: string; name: string; qty: number; revenue: number }
    >();
    for (const p of completed) {
      const key = p.productId;
      const entry = rankingMap.get(key) || {
        productId: key,
        name: p.product?.name || 'Produto',
        qty: 0,
        revenue: 0,
      };
      entry.qty += 1;
      entry.revenue += Number(p.price);
      rankingMap.set(key, entry);
    }
    const productRanking = Array.from(rankingMap.values()).sort(
      (a, b) => b.qty - a.qty,
    );

    // Scans / visitas.
    const scansCount = await this.prisma.eventVisit.count({
      where: { eventId },
    });

    // Comparativo: média dos eventos anteriores do mesmo vendedor.
    const previousEvents = await this.prisma.garageEvent.findMany({
      where: { sellerId, id: { not: eventId } },
      select: { id: true },
    });
    let previousAverageRevenue = 0;
    let previousAverageSales = 0;
    if (previousEvents.length > 0) {
      const prevProductIds = await this.prisma.product.findMany({
        where: { eventId: { in: previousEvents.map((e) => e.id) } },
        select: { id: true },
      });
      const prevPurchases = await this.prisma.purchase.findMany({
        where: {
          productId: { in: prevProductIds.map((p) => p.id) },
          status: 'COMPLETED',
        },
      });
      const prevRevenue = prevPurchases.reduce(
        (sum, p) => sum + Number(p.price),
        0,
      );
      previousAverageRevenue = prevRevenue / previousEvents.length;
      previousAverageSales = prevPurchases.length / previousEvents.length;
    }

    return {
      metrics: {
        totalRevenue,
        salesCount,
        ticketAverage,
        productsListed: listedCount,
        productsSold,
        conversionRate,
        scansCount,
      },
      productRanking,
      comparison: {
        previousEventsCount: previousEvents.length,
        previousAverageRevenue,
        previousAverageSales,
        revenueDelta:
          previousAverageRevenue > 0
            ? ((totalRevenue - previousAverageRevenue) /
                previousAverageRevenue) *
              100
            : null,
        salesDelta:
          previousAverageSales > 0
            ? ((salesCount - previousAverageSales) / previousAverageSales) * 100
            : null,
      },
    };
  }
}
