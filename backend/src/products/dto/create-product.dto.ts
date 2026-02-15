import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { ProductCondition } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0)
    price: number;

    @IsOptional()
    @IsString()
    imageUrl?: string;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsEnum(ProductCondition)
    condition?: ProductCondition;
}
