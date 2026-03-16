import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'usuario@exemplo.com',
    description: 'Email do usuário para cadastro',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    description: 'Senha do usuário (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
    description: 'Função do usuário no sistema',
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    example: '+55 11 98765-4321',
    description: 'Telefone de contato do usuário (opcional)',
  })
  @IsOptional()
  @IsString()
  phone?: string;
}
