import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MateriaisEstoqueController } from './materiais-estoque.controller';
import { MateriaisEstoqueService } from './materiais-estoque.service';

@Module({
  imports: [PrismaModule],
  controllers: [MateriaisEstoqueController],
  providers: [MateriaisEstoqueService],
})
export class MateriaisEstoqueModule {}
