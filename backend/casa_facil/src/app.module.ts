import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { ClientesModule } from './clientes/clientes.module';
import { MateriaisEstoqueModule } from './materiais-estoque/materiais-estoque.module';
import { ModeloCasaModule } from './modelo_casa/modelo-casa.module';
import { MovimentacaoModule } from './movimentacao_materiais/movimentacao.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { VendasModule } from './vendas/vendas.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientesModule,
    ModeloCasaModule,
    VendasModule,
    MovimentacaoModule,
    MateriaisEstoqueModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
