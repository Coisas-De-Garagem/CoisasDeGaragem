import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { EventStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    example: 'Brechó de Verão',
    description: 'Nome do evento / garage sale',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional({
    example: 'Garage sale com roupas, móveis e eletrônicos.',
    description: 'Descrição do evento',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    enum: EventStatus,
    example: EventStatus.DRAFT,
    description: 'Status do evento (DRAFT, PUBLISHED, ACTIVE, ENDED, CANCELLED)',
  })
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @ApiPropertyOptional({
    example: '2026-08-01T12:00:00.000Z',
    description: 'Data e hora de início do evento',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    example: '2026-08-03T18:00:00.000Z',
    description: 'Data e hora de fim do evento',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  // ---- Endereço estruturado ----
  @ApiPropertyOptional({ example: 'Rua das Flores', description: 'Rua do endereço' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  street?: string;

  @ApiPropertyOptional({ example: '123', description: 'Número do endereço' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  number?: string;

  @ApiPropertyOptional({ example: 'Centro', description: 'Bairro' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ example: 'São Paulo', description: 'Cidade' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: '01000-000', description: 'CEP' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zipCode?: string;
}
