import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAbacatePixDto {
  @ApiProperty({ description: 'The ID of the purchase to create a payment for' })
  @IsString()
  @IsNotEmpty()
  purchaseId: string;
}
