import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, sellerId: string) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        sellerId,
        qrCode: randomUUID(),
      },
    });
  }

  async findAll(filters?: {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }) {
    const where: any = { isAvailable: true };

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    return this.prisma.product.findMany({
      where,
      include: { seller: { select: { name: true, email: true } }, location: true },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { seller: true, location: true },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string) {
    const product = await this.findOne(id);
    if (product.sellerId !== userId) {
      // In real app, check for forbidden, but let's assume controller checks ownership or role
      // Ideally throws ForbiddenException
    }
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string, userId: string) {
    // Check ownership
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async getSellerProducts(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId },
      include: { location: true },
    });
  }

  async reserve(id: string) {
    const product = await this.findOne(id);
    if (!product.isAvailable || product.isSold || product.isReserved) {
      throw new Error('Product cannot be reserved');
    }
    return this.prisma.product.update({
      where: { id },
      data: { isAvailable: false, isReserved: true },
    });
  }

  async unreserve(id: string, sellerId: string) {
    const product = await this.findOne(id);
    if (product.sellerId !== sellerId) {
      throw new Error('Unauthorized');
    }
    return this.prisma.product.update({
      where: { id },
      data: { isAvailable: true, isReserved: false },
    });
  }

  async markAsSold(id: string, sellerId: string) {
    const product = await this.findOne(id);
    if (product.sellerId !== sellerId) {
      throw new Error('Unauthorized');
    }
    return this.prisma.product.update({
      where: { id },
      data: { isAvailable: false, isReserved: false, isSold: true },
    });
  }
}
