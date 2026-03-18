import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { ProductCondition } from '@prisma/client';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'Bicicleta Mountain Bike',
    description: 'Nome do produto',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Bicicleta em ótimo estado, usada poucas vezes. Ideal para trilhas e passeios.',
    description: 'Descrição detalhada do produto',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 1500.00,
    description: 'Preço do produto em reais',
    minimum: 0,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    example: 'https://example.com/images/bike.jpg',
    description: 'URL da imagem do produto',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'Esportes',
    description: 'Categoria do produto',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    enum: ProductCondition,
    example: ProductCondition.GOOD,
    description: 'Condição do produto (NEW, LIKE_NEW, GOOD, FAIR, POOR)',
  })
  @IsOptional()
  @IsEnum(ProductCondition)
  condition?: ProductCondition;
}
