import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllBySeller(sellerId: string) {
    return this.prisma.location.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
  }

  async create(
    sellerId: string,
    data: { name: string; address: string; isActive?: boolean },
  ) {
    return this.prisma.location.create({
      data: {
        name: data.name,
        address: data.address,
        isActive: data.isActive ?? true,
        sellerId,
      },
    });
  }

  async update(
    sellerId: string,
    locationId: string,
    data: { name?: string; address?: string; isActive?: boolean },
  ) {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) throw new NotFoundException('Local não encontrado');
    if (location.sellerId !== sellerId)
      throw new ForbiddenException('Acesso negado');

    return this.prisma.location.update({
      where: { id: locationId },
      data,
    });
  }

  async toggleStatus(sellerId: string, locationId: string) {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) throw new NotFoundException('Local não encontrado');
    if (location.sellerId !== sellerId)
      throw new ForbiddenException('Acesso negado');

    return this.prisma.location.update({
      where: { id: locationId },
      data: { isActive: !location.isActive },
    });
  }
}
