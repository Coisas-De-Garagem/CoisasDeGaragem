import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            token: this.jwtService.sign(payload),
            expiresIn: 3600, // 1 hour
            user,
        };
    }

    async register(registerDto: RegisterDto) {
        const existing = await this.usersService.findOne(registerDto.email);
        if (existing) {
            throw new ConflictException('User already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.usersService.create({
            ...registerDto,
            password: hashedPassword,
        });
        const { password, ...result } = user;

        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            token: this.jwtService.sign(payload),
            expiresIn: 3600,
            user: result,
        };
    }
}
