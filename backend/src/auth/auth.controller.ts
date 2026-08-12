import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  BadRequestException,
  Put,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from './current-user.decorator';
import { AuthenticatedUser } from './auth-user.interface';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Login do usuário',
    description: 'Autentica um usuário e retorna um token JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'user-id',
          email: 'usuario@exemplo.com',
          name: 'João Silva',
          role: 'USER',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({
    summary: 'Registro de novo usuário',
    description: 'Cria uma nova conta de usuário no sistema',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        id: 'user-id',
        email: 'usuario@exemplo.com',
        name: 'João Silva',
        role: 'USER',
        phone: '+55 11 98765-4321',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'email must be an email',
          'password must be longer than or equal to 6 characters',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Email já cadastrado',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      },
    },
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('google')
  @ApiOperation({
    summary: 'Autenticação com Google',
    description:
      'Autentica o usuário a partir de um ID Token do Google. Se o usuário não existir, ele é registrado automaticamente.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 3600,
        user: {
          id: 'user-id',
          email: 'usuario@exemplo.com',
          name: 'João Silva',
          role: 'USER',
          avatarUrl: 'https://lh3.googleusercontent.com/...',
        },
      },
    },
  })
  async googleLogin(@Body('token') token: string) {
    if (!token) {
      throw new BadRequestException('Google ID token is required');
    }
    return this.authService.googleLogin(token);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obter perfil do usuário atual',
    description: 'Retorna as informações do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário',
    schema: {
      example: {
        id: 'user-id',
        email: 'usuario@exemplo.com',
        name: 'João Silva',
        role: 'USER',
        phone: '+55 11 98765-4321',
        createdAt: '2024-01-15T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado - token inválido ou ausente',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: 'Unauthorized',
      },
    },
  })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return user;
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('me')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Atualizar perfil do usuário atual',
    description: 'Atualiza informações do usuário autenticado',
  })
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() updateData: { name?: string; phone?: string; avatarUrl?: string },
  ) {
    return this.authService.updateProfile(user.userId, updateData);
  }
}
