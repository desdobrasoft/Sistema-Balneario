import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    // Criptografa a senha.
    const password_hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.users.create({
      data: {
        full_name: dto.full_name,
        username: dto.username,
        email: dto.email,
        password_hash,
        // Mapeia as roles para inserir em sua respectiva tabela.
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

    // Remove o hash antes de retornar.
    const { password_hash: _, ...safeUser } = user;

    // Retorna o usuário criado com suas roles.
    return {
      ...safeUser,
      roles: user.user_roles.map((ur) => ur.roles.role),
    };
  }

  async deleteUser(id: number) {
    // Remove o usuário pelo ID.
    await this.prisma.users.delete({ where: { id } });
    // Retorna uma mensagem de sucesso.
    return { message: 'Usuário removido com sucesso' };
  }

  async findAllWithRoles() {
    // Lista todos os usuários e sua funções.
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
    // Lista um único usuário e suas funções.
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
    return this.prisma.$transaction(async (tx) => {
      // Atualiza os dados do usuário
      const userData: any = {
        full_name: dto.full_name,
        username: dto.username,
        email: dto.email,
        updated_at: new Date(),
      };

      if (dto.password) {
        userData.password_hash = await bcrypt.hash(dto.password, 12);
      }

      await tx.users.update({
        where: { id },
        data: userData,
      });

      // Sincroniza as roles
      if (dto.roles) {
        // Deleta as roles antigas
        await tx.user_roles.deleteMany({ where: { user_id: id } });

        // Adiciona as novas roles
        const rolesToConnect = await tx.roles.findMany({
          where: { role: { in: dto.roles } },
        });

        if (rolesToConnect.length > 0) {
          await tx.user_roles.createMany({
            data: rolesToConnect.map((role) => ({
              user_id: id,
              role_id: role.id,
            })),
          });
        }
      }

      // Retorna o usuário atualizado com as novas roles
      return tx.users.findUnique({
        where: { id },
        include: {
          user_roles: {
            include: { roles: true },
          },
        },
      });
    });
  }

  async update(id: number, data: Prisma.usersUpdateInput) {
    return this.prisma.users.update({
      where: { id },
      data,
    });
  }
}
