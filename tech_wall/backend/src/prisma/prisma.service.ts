import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();

    // 1. Defina a lógica de soft delete UMA VEZ em uma constante.
    // Ela será aplicada a qualquer modelo que precisarmos.
    const softDeleteActions = {
      async delete(args: any) {
        const ctx = Prisma.getExtensionContext(this);
        // A lógica agora é reutilizável e usa o contexto correto
        return (ctx as any).update({
          ...args,
          data: { deleted_at: new Date() },
        });
      },
    };

    this.$extends({
      query: {
        $allModels: {
          // Filtra as buscas para todos os modelos que tiverem 'deleted_at'
          async findMany({ args, query }) {
            args.where = { ...args.where, deleted_at: null };
            return query(args);
          },
          async findUnique({ args, query }) {
            args.where = { ...args.where, deleted_at: null };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { ...args.where, deleted_at: null };
            return query(args);
          },
        },
      },
      model: {
        // 2. Aplique a lógica de soft delete aos modelos desejados
        modelo_casa: softDeleteActions,
        materiais_estoque: softDeleteActions,
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
