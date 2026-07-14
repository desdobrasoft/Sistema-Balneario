import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../generated/prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private _extendedClient: any;

  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });

    const softDeleteActions = {
      async delete(this: any, args: any) {
        const ctx = Prisma.getExtensionContext(this);
        return await ctx.update({
          ...args,
          data: { deletedAt: new Date() },
        });
      },

      async deleteMany(this: any, args: any) {
        const ctx = Prisma.getExtensionContext(this);
        return await ctx.updateMany({
          ...args,
          data: { deletedAt: new Date() },
        });
      },
    };

    this._extendedClient = this.$extends({
      query: {
        modeloCasa: {
          async findMany({ args, query }) {
            args.where = { deletedAt: null, ...args.where };
            return query(args);
          },
          async findUnique({ args, query }) {
            args.where = { deletedAt: null, ...args.where };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { deletedAt: null, ...args.where };
            return query(args);
          },
        },
        materiaPrima: {
          async findMany({ args, query }) {
            args.where = { deletedAt: null, ...args.where };
            return query(args);
          },
          async findUnique({ args, query }) {
            args.where = { deletedAt: null, ...args.where };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { deletedAt: null, ...args.where };
            return query(args);
          },
        },
        placa: {
          async findMany({ args, query }) {
            args.where = { deletedAt: null, ...args.where };
            return query(args);
          },
          async findUnique({ args, query }) {
            args.where = { deletedAt: null, ...args.where };
            return query(args);
          },
          async findFirst({ args, query }) {
            args.where = { deletedAt: null, ...args.where };
            return query(args);
          },
        },
      },
      model: {
        modeloCasa: softDeleteActions,
        materiaPrima: softDeleteActions,
        placa: softDeleteActions,
      },
    });

    return this._extendedClient;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
