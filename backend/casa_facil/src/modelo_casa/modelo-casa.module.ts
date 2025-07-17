import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ModeloCasaController } from './modelo-casa.controller';
import { ModeloCasaService } from './modelo-casa.service';

@Module({
  imports: [PrismaModule], // Importa o PrismaModule para o serviço poder usar o Prisma Client
  controllers: [ModeloCasaController],
  providers: [ModeloCasaService],
})
export class ModeloCasaModule {}
