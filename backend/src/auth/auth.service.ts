import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SafeUser, stripPassword } from '../users/user.utils';
import { getErrorMessage } from '../common/error.util';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

/** Subset of the Google tokeninfo response that we rely on. */
interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string;
  name?: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, pass: string): Promise<SafeUser | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      return stripPassword(user);
    }
    return null;
  }

  async updateProfile(
    userId: string,
    updateData: { name?: string; phone?: string; avatarUrl?: string },
  ): Promise<SafeUser> {
    const user = await this.usersService.update(userId, updateData);
    return stripPassword(user);
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
    const result = stripPassword(user);

    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      token: this.jwtService.sign(payload),
      expiresIn: 3600,
      user: result,
    };
  }

  async googleLogin(token: string) {
    try {
      // Mock bypass for local development testing
      if (
        token === 'mock-google-token' &&
        this.configService.get<string>('NODE_ENV') !== 'production'
      ) {
        let user = await this.usersService.findOne(
          'mock-google-user@example.com',
        );
        if (!user) {
          const dummyPassword = await bcrypt.hash(crypto.randomUUID(), 10);
          user = await this.usersService.create({
            email: 'mock-google-user@example.com',
            name: 'Mock Google User',
            password: dummyPassword,
            role: 'USER',
          });
        }
        const result = stripPassword(user);
        const jwtPayload = { email: user.email, sub: user.id, role: user.role };
        return {
          token: this.jwtService.sign(jwtPayload),
          expiresIn: 3600,
          user: result,
        };
      }

      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
      );
      if (!response.ok) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const payload = (await response.json()) as GoogleTokenInfo;

      // Validate Client ID if configured in env
      const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
      if (googleClientId && payload.aud !== googleClientId) {
        throw new UnauthorizedException('Token audience mismatch');
      }

      const email = payload.email;
      if (!email) {
        throw new UnauthorizedException('Email not provided by Google');
      }

      let user = await this.usersService.findOne(email);

      if (!user) {
        // Automatically register user if they do not exist
        const dummyPassword = await bcrypt.hash(crypto.randomUUID(), 10);
        user = await this.usersService.create({
          email,
          name: payload.name || email.split('@')[0],
          password: dummyPassword,
          role: 'USER',
          avatarUrl: payload.picture || null,
        });
      } else if (!user.avatarUrl && payload.picture) {
        // Sync avatar image from Google
        user = await this.usersService.update(user.id, {
          avatarUrl: payload.picture,
        });
      }

      const result = stripPassword(user);
      const jwtPayload = { email: user.email, sub: user.id, role: user.role };

      return {
        token: this.jwtService.sign(jwtPayload),
        expiresIn: 3600,
        user: result,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(
        `Google authentication failed: ${getErrorMessage(error)}`,
      );
    }
  }
}
