import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePurchaseDto {
    @IsNotEmpty()
    @IsString()
    productId: string;

    @IsOptional()
    @IsEnum(PaymentMethod)
    paymentMethod?: PaymentMethod;

    @IsOptional()
    @IsString()
    notes?: string;
}
