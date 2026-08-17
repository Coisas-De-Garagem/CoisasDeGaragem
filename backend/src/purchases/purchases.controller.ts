import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthenticatedUser } from '../auth/auth-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('purchases')
@Controller('purchases')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar compras do comprador',
    description:
      'Retorna uma lista paginada de compras feitas pelo usuário autenticado',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página (padrão: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página (padrão: 20)',
    example: 20,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filtrar por status (PENDING, COMPLETED, CANCELLED, REFUNDED)',
    example: 'PENDING',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de compras',
    schema: {
      example: {
        data: [
          {
            id: 'purchase-id',
            productId: 'product-id',
            buyerId: 'buyer-id',
            sellerId: 'seller-id',
            price: 1500.0,
            currency: 'BRL',
            status: 'PENDING',
            paymentMethod: 'PIX',
            purchaseDate: '2024-01-15T10:30:00.000Z',
            notes: 'Posso retirar no fim de semana',
            qrCodeScanned: false,
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;

    return this.purchasesService.findAllByBuyer(
      user?.userId,
      isNaN(pageNumber) ? 1 : pageNumber,
      isNaN(limitNumber) ? 20 : limitNumber,
      status,
    );
  }

  @Post()
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Criar nova compra',
    description:
      'Cria uma nova compra de um produto. O usuário autenticado será o comprador.',
  })
  @ApiResponse({
    status: 201,
    description: 'Compra criada com sucesso',
    schema: {
      example: {
        id: 'purchase-id',
        productId: 'product-id',
        buyerId: 'buyer-id',
        sellerId: 'seller-id',
        price: 1500.0,
        currency: 'BRL',
        status: 'PENDING',
        paymentMethod: 'PIX',
        purchaseDate: '2024-01-15T10:30:00.000Z',
        notes: 'Posso retirar no fim de semana',
        qrCodeScanned: false,
        createdAt: '2024-01-15T10:30:00.000Z',
        updatedAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  @ApiBody({ type: CreatePurchaseDto })
  create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.purchasesService.create(createPurchaseDto, user.userId);
  }

  @Get('history')
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Histórico de compras',
    description: 'Retorna todo o histórico de compras do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de compras',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  getHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.findAllByBuyer(user?.userId);
  }

  @Get('sales')
  @Roles(UserRole.USER)
  @ApiOperation({
    summary: 'Histórico de vendas',
    description: 'Retorna todo o histórico de vendas do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Histórico de vendas',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  getSales(@CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.findAllBySeller(user?.userId);
  }

  @Get(':id')
  @SkipThrottle()
  @ApiOperation({
    summary: 'Buscar compra por ID',
    description: 'Retorna os detalhes de uma compra específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da compra',
    example: 'purchase-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes da compra',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para ver esta compra',
  })
  @ApiResponse({
    status: 404,
    description: 'Compra não encontrada',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.findOne(id, user.userId);
  }
}
