import { IsInt, Min, Max, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Rating from 1 to 5', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Optional comment', example: 'Great seller!' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: 'ID of the purchase being reviewed' })
  @IsUUID()
  purchaseId: string;
}
