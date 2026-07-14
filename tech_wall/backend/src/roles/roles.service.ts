import { Injectable, NotFoundException } from '@nestjs/common';
import { ALL_MODULE_KEYS } from '../common/constants/app-modules';
import {
  DataTableParamsDto,
  DataTableResult,
} from '../common/dto/data-table.dto';
import { PrismaDatatableHelper } from '../common/utils/datatable.helper';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    return this.prisma.role.create({
      data: {
        role: dto.role,
        permissions: dto.permissions,
      },
    });
  }

  async findAll() {
    return this.prisma.role.findMany({ orderBy: { id: 'desc' } });
  }

  async findDatatable(
    query: DataTableParamsDto,
  ): Promise<DataTableResult<any>> {
    return PrismaDatatableHelper.execute({
      prismaModel: this.prisma.role,
      query,
      searchableFields: ['role'],
      customSearchEnhancer: async (searchValue: string) => {
        const searchStr = searchValue.toLowerCase();

        const allRoles = await this.prisma.role.findMany({
          select: { id: true, permissions: true },
        });

        const matchingRoleIds = allRoles
          .filter((role) => {
            const permsStr =
              !role.permissions || role.permissions.length === 0
                ? 'Sem permissões'
                : role.permissions.length >= ALL_MODULE_KEYS.length
                  ? 'Acesso Total'
                  : role.permissions.join(', ');

            return permsStr.toLowerCase().includes(searchStr);
          })
          .map((r) => r.id);

        if (matchingRoleIds.length > 0) {
          return [{ id: { in: matchingRoleIds } }];
        }
        return [];
      },
      mapRow: (role: any) => ({
        id: role.id,
        role: role.role,
        permissions:
          !role.permissions || role.permissions.length === 0
            ? 'Sem permissões'
            : role.permissions.length >= ALL_MODULE_KEYS.length
              ? 'Acesso Total'
              : role.permissions.join(', '),
      }),
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Cargo com ID ${id} não encontrado`);
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    // Verifica existência
    await this.findOne(id);

    return this.prisma.role.update({
      where: { id },
      data: {
        role: dto.role,
        permissions: dto.permissions,
      },
    });
  }

  async remove(id: number) {
    // Verifica existência
    await this.findOne(id);

    return this.prisma.role.delete({
      where: { id },
    });
  }
}
