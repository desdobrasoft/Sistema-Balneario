import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: {
      include: {
        role: true;
      };
    };
  };
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto) {
    // Criptografa a senha.
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        username: dto.username,
        email: dto.email,
        passwordHash,
        // Mapeia as roles para inserir em sua respectiva tabela.
        roles: dto.roles
          ? {
              create: dto.roles.map((roleName) => ({
                role: {
                  connectOrCreate: {
                    where: { role: roleName },
                    create: { role: roleName },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    // Remove o hash antes de retornar.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeUser } = user;

    // Retorna o usuário criado com suas roles.
    return {
      ...safeUser,
      roles: user.roles.map((ur) => ur.role.role),
    };
  }

  async deleteUser(id: number) {
    // Remove o usuário pelo ID.
    await this.prisma.user.delete({ where: { id } });
    // Retorna uma mensagem de sucesso.
    return { message: 'Usuário removido com sucesso' };
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: { id: 'desc' },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.user,
      query,
      searchableFields: ['fullName', 'username', 'email'],
      include: { roles: { include: { role: true } } },
      mapRow: (user) => ({
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        roles: user.roles?.map((ur: any) => ur.role?.role).join(', ') || '',
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
    });
  }

  async findByIdWithRoles(id: number) {
    // Lista um único usuário e suas funções.
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async findByUsernameOrEmail(usernameOrEmail: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async updateOwnUser(userId: number, dto: UpdateUserDto) {
    const data: any = {
      fullName: dto.fullName,
      username: dto.username,
      email: dto.email,
      updatedAt: new Date(),
    };

    if (dto.password) {
      data.passwordHash = await bcrypt.hash(dto.password, 12);
    }

    // Ignora roles se vierem por acaso
    delete dto.roles;

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      include: {
        roles: {
          include: { role: true },
        },
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _passwordHash, ...safeUser } = updated;

    return {
      ...safeUser,
      roles: updated.roles.map((ur) => ur.role.role),
    };
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    return this.prisma.$transaction(async (tx) => {
      // Atualiza os dados do usuário
      const userData: any = {
        fullName: dto.fullName,
        username: dto.username,
        email: dto.email,
        updatedAt: new Date(),
      };

      if (dto.password) {
        userData.passwordHash = await bcrypt.hash(dto.password, 12);
      }

      if (dto.roles) {
        userData.roles = {
          deleteMany: {},
          create: dto.roles.map((roleName) => ({
            role: {
              connectOrCreate: {
                where: { role: roleName },
                create: { role: roleName },
              },
            },
          })),
        };
      }

      await tx.user.update({
        where: { id },
        data: userData,
      });

      // Retorna o usuário atualizado com as novas roles
      return tx.user.findUnique({
        where: { id },
        include: {
          roles: {
            include: { role: true },
          },
        },
      });
    });
  }

  async update(id: number, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
