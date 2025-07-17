import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();

    this.$extends({
      model: {
        // Aplica a extensão especificamente para o modelo 'modelo_casa'
        modelo_casa: {
          // Sobrescreve o método 'delete'
          async delete(args: any) {
            const ctx = Prisma.getExtensionContext(this);
            // Chama o método 'update' original para fazer o soft delete
            return (ctx as any).update({
              where: args.where,
              data: {
                deleted_at: new Date(),
              },
            });
          },
        },
      },
      // Adiciona um query block para filtrar as buscas
      query: {
        modelo_casa: {
          // Filtra todas as operações de busca
          async findUnique({ args, query }) {
            args.where = { ...args.where, deleted_at: null };
            return query(args);
          },
          async findMany({ args, query }) {
            args.where = { ...args.where, deleted_at: null };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { ...args.where, deleted_at: null };
            return query(args);
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
