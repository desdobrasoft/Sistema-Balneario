import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { ClientesModule } from './clientes/clientes.module';
import { EntregasModule } from './entregas/entregas.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { MateriaisEstoqueModule } from './materiais-estoque/materiais-estoque.module';
import { ModeloCasaModule } from './modelo-casa/modelo-casa.module';
import { MovimentacaoModule } from './movimentacao-materiais/movimentacao.module';
import { PedidosCompraModule } from './pedidos-compra/pedidos-compra.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProducaoModule } from './producao/producao.module';
import { TiposMateriaisModule } from './tipos-materiais/tipos-materiais.module';
import { UsersModule } from './users/users.module';
import { VendasModule } from './vendas/vendas.module';
import { DashboardModule } from './dashboard/dashboard.module';

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
    FinanceiroModule,
    ProducaoModule,
    EntregasModule,
    PedidosCompraModule,
    TiposMateriaisModule,
    DashboardModule,
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