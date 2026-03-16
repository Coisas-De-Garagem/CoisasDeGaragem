import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({
    example: 'product-id',
    description: 'ID do produto a ser comprado',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiPropertyOptional({
    enum: PaymentMethod,
    example: PaymentMethod.PIX,
    description: 'Método de pagamento (CASH, CARD, PIX, OTHER)',
  })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({
    example: 'Posso retirar no fim de semana',
    description: 'Notas adicionais sobre a compra',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
