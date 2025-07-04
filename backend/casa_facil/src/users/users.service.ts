import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service'; // veja observação abaixo
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    const password_hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.users.create({
      data: {
        full_name: dto.full_name,
        username: dto.username,
        email: dto.email,
        password_hash,
        user_roles: dto.roles
          ? {
              create: dto.roles.map((roleName) => ({
                roles: {
                  connect: { role: roleName },
                },
              })),
            }
          : undefined,
      },
      include: {
        user_roles: {
          include: { roles: true },
        },
      },
    });

    // Remove o hash antes de retornar
    const { password_hash: _, ...safeUser } = user;

    return {
      ...safeUser,
      roles: user.user_roles.map((ur) => ur.roles.role),
    };
  }

  async findAllWithRoles() {
    return this.prisma.users.findMany({
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async findByIdWithRoles(id: number) {
    return this.prisma.users.findUnique({
      where: { id },
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    return this.prisma.users.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });
  }
}
