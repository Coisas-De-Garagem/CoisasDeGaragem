import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar novo produto',
    description: 'Cria um novo produto no sistema. O usuário autenticado será o vendedor.',
  })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso',
    schema: {
      example: {
        id: 'product-id',
        sellerId: 'user-id',
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
  @ApiBody({ type: CreateProductDto })
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user: any) {
    return this.productsService.create(createProductDto, user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os produtos',
    description: 'Retorna uma lista de todos os produtos disponíveis no sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos',
    schema: {
      example: [
        {
          id: 'product-id',
          sellerId: 'user-id',
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
      ],
    },
  })
  findAll() {
    return this.productsService.findAll();
  }

  @Get('my-products')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Listar meus produtos',
    description: 'Retorna todos os produtos cadastrados pelo usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos do usuário',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  getMyProducts(@CurrentUser() user: any) {
    return this.productsService.getSellerProducts(user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por ID',
    description: 'Retorna os detalhes de um produto específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: 'product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do produto',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar produto',
    description: 'Atualiza os dados de um produto existente. Apenas o vendedor pode atualizar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: 'product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso',
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
    status: 403,
    description: 'Sem permissão para atualizar este produto',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  @ApiBody({ type: UpdateProductDto })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user: any,
  ) {
    return this.productsService.update(id, updateProductDto, user.userId);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deletar produto',
    description: 'Remove um produto do sistema. Apenas o vendedor pode deletar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: 'product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto deletado com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para deletar este produto',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.remove(id, user.userId);
  }

  @Patch(':id/reserve')
  @ApiOperation({
    summary: 'Reservar produto',
    description: 'Marca um produto como reservado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: 'product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto reservado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  reserve(@Param('id') id: string) {
    return this.productsService.reserve(id);
  }

  @Patch(':id/unreserve')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Cancelar reserva do produto',
    description: 'Remove a reserva de um produto. Apenas o vendedor pode cancelar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: 'product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Reserva cancelada com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para cancelar reserva',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  unreserve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.unreserve(id, user.userId);
  }

  @Patch(':id/sold')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.USER)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Marcar produto como vendido',
    description: 'Marca um produto como vendido. Apenas o vendedor pode marcar.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do produto',
    example: 'product-id',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto marcado como vendido com sucesso',
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado',
  })
  @ApiResponse({
    status: 403,
    description: 'Sem permissão para marcar como vendido',
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  markAsSold(@Param('id') id: string, @CurrentUser() user: any) {
    return this.productsService.markAsSold(id, user.userId);
  }
}
