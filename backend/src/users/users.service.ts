import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(
    id: string,
    data: { name?: string; phone?: string; avatarUrl?: string | null },
  ): Promise<User> {
    // Allowlist explícita: nunca repassar o corpo cru ao Prisma, para que
    // campos como `role` não possam ser gravados por mass assignment.
    const allowed: Prisma.UserUpdateInput = {};
    if (data.name !== undefined) allowed.name = data.name;
    if (data.phone !== undefined) allowed.phone = data.phone;
    if (data.avatarUrl !== undefined) allowed.avatarUrl = data.avatarUrl;

    return this.prisma.user.update({
      where: { id },
      data: allowed,
    });
  }
}
