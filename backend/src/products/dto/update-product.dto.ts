import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductCondition } from '@prisma/client';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiPropertyOptional({
    description: 'Nome do produto (opcional para atualização parcial)',
    example: 'Bicicleta Mountain Bike Atualizada',
  })
  name?: string;

  @ApiPropertyOptional({
    description:
      'Descrição detalhada do produto (opcional para atualização parcial)',
    example: 'Bicicleta em excelente estado, com novos acessórios.',
  })
  description?: string;

  @ApiPropertyOptional({
    description:
      'Preço do produto em reais (opcional para atualização parcial)',
    example: 1800.0,
    minimum: 0,
  })
  price?: number;

  @ApiPropertyOptional({
    description: 'URL da imagem do produto (opcional para atualização parcial)',
    example: 'https://example.com/images/bike-updated.jpg',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Categoria do produto (opcional para atualização parcial)',
    example: 'Esportes',
  })
  category?: string;

  @ApiPropertyOptional({
    enum: ProductCondition,
    example: ProductCondition.LIKE_NEW,
    description: 'Condição do produto (opcional para atualização parcial)',
  })
  condition?: ProductCondition;
}
