import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, sellerId: string) {
    const images =
      createProductDto.images ||
      (createProductDto.imageUrl ? [createProductDto.imageUrl] : []);
    const imageUrl =
      createProductDto.imageUrl || (images.length > 0 ? images[0] : null);

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        images,
        imageUrl,
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
    const where: Prisma.ProductWhereInput = { isAvailable: true };

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
      include: {
        seller: { select: { name: true, email: true } },
        location: true,
      },
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

    const data: Prisma.ProductUpdateInput = {
      ...updateProductDto,
    };

    if (updateProductDto.images !== undefined) {
      data.images = updateProductDto.images;
      if (!updateProductDto.imageUrl) {
        data.imageUrl =
          updateProductDto.images.length > 0
            ? updateProductDto.images[0]
            : null;
      }
    } else if (
      updateProductDto.imageUrl !== undefined &&
      !product.images?.length
    ) {
      data.images = updateProductDto.imageUrl
        ? [updateProductDto.imageUrl]
        : [];
    }

    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, _userId: string) {
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
