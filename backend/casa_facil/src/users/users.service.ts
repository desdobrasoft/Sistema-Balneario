import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // veja observação abaixo

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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
