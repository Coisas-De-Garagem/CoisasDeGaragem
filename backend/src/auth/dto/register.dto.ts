import { IsEmail, IsEnum, IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    name: string;

    @IsEnum(UserRole)
    role: UserRole;

    @IsOptional()
    @IsString()
    phone?: string;
}
