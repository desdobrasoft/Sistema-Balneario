import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service'; // veja observação abaixo
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';

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

  async deleteUser(id: number) {
    await this.prisma.users.delete({ where: { id } });
    return { message: 'Usuário removido com sucesso' };
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

  async updateOwnUser(userId: number, dto: UpdateUserDto) {
    const data: any = {
      full_name: dto.full_name,
      username: dto.username,
      email: dto.email,
      updated_at: new Date(),
    };

    if (dto.password) {
      data.password_hash = await bcrypt.hash(dto.password, 12);
    }

    // Ignora roles se vierem por acaso
    delete dto.roles;

    const updated = await this.prisma.users.update({
      where: { id: userId },
      data,
      include: {
        user_roles: {
          include: { roles: true },
        },
      },
    });

    const { password_hash: _, ...safeUser } = updated;

    return {
      ...safeUser,
      roles: updated.user_roles.map((ur) => ur.roles.role),
    };
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const data: any = {
      full_name: dto.full_name,
      username: dto.username,
      email: dto.email,
      updated_at: new Date(),
    };

    if (dto.password) {
      data.password_hash = await bcrypt.hash(dto.password, 12);
    }

    // Atualiza o usuário
    await this.prisma.users.update({
      where: { id },
      data,
    });

    // Atualiza roles, se necessário
    if (dto.roles) {
      await this.prisma.user_roles.deleteMany({ where: { user_id: id } });

      for (const roleName of dto.roles) {
        const role = await this.prisma.roles.findUnique({
          where: { role: roleName },
        });

        if (role) {
          await this.prisma.user_roles.create({
            data: {
              user_id: id,
              role_id: role.id,
            },
          });
        }
      }
    }

    return this.findByIdWithRoles(id);
  }
}
