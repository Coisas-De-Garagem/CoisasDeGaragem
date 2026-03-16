import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('qr-codes')
@Controller('qr-codes')
export class QrCodesController {
  constructor(private prisma: PrismaService) {}

  @Get(':productId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Gerar QR Code do produto',
    description: 'Gera um QR Code que redireciona para a página do produto no frontend',
  })
  @ApiParam({
    name: 'productId',
    description: 'ID do produto',
    example: 'product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'QR Code gerado com sucesso',
    schema: {
      example: {
        url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2Flocalhost%3A5173%2Fproduct%2Fproduct-id',
        code: 'unique-qr-code',
        productUrl: 'http://localhost:5173/product/product-id',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  async getQRCode(@Param('productId') productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    // Return Base64 QR code pointing to the frontend product page
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const productUrl = `${frontendUrl}/product/${product.id}`;

    return {
      url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(productUrl)}`,
      code: product.qrCode,
      productUrl,
    };
  }

  @Post('scan')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Escanear QR Code',
    description: 'Valida um QR Code e retorna os dados do produto e do vendedor',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        qrCode: {
          type: 'string',
          description: 'Código QR ou ID do produto',
          example: 'unique-qr-code',
        },
      },
      required: ['qrCode'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'QR Code válido',
    schema: {
      example: {
        product: {
          id: 'product-id',
          sellerId: 'seller-id',
          name: 'Bicicleta Mountain Bike',
          description: 'Bicicleta em ótimo estado',
          price: 1500.00,
          currency: 'BRL',
          imageUrl: 'https://example.com/image.jpg',
          category: 'Esportes',
          condition: 'GOOD',
          qrCode: 'unique-qr-code',
          isAvailable: true,
          isReserved: false,
          isSold: false,
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        seller: {
          id: 'seller-id',
          email: 'vendedor@exemplo.com',
          name: 'João Silva',
          role: 'USER',
          phone: '+55 11 98765-4321',
          createdAt: '2024-01-15T10:30:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'QR Code inválido',
  })
  async scanQRCode(@Body() data: { qrCode: string }) {
    // Try to find by qrCode field first
    let product = await this.prisma.product.findUnique({
      where: { qrCode: data.qrCode },
      include: { seller: true },
    });

    // If not found, try to find by ID (in case the QR code contains the product ID)
    if (!product) {
      product = await this.prisma.product.findUnique({
        where: { id: data.qrCode },
        include: { seller: true },
      });
    }

    if (!product) {
      throw new NotFoundException('Invalid QR Code');
    }

    return {
      product,
      seller: product.seller,
    };
  }
}
