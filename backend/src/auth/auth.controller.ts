import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Request() req) {
        return req.user;
    }
}
