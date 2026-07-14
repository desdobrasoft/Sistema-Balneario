import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { ClientesModule } from './clientes/clientes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { EntregasModule } from './entregas/entregas.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { MateriaPrimaModule } from './materia-prima/materia-prima.module';
import { ModeloCasaModule } from './modelo-casa/modelo-casa.module';
import { MovimentacaoModule } from './movimentacao-materiais/movimentacao.module';
import { NotasFiscaisModule } from './notas-fiscais/notas-fiscais.module';
import { PedidosCompraModule } from './pedidos-compra/pedidos-compra.module';
import { PlacasModule } from './placas/placas.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProducaoModule } from './producao/producao.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RolesModule } from './roles/roles.module';
import { TramasModule } from './tramas/tramas.module';
import { TiposPlacaModule } from './tipos-placa/tipos-placa.module';
import { UsersModule } from './users/users.module';
import { VendasModule } from './vendas/vendas.module';
import { CortesModule } from './cortes/cortes.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    RolesModule,
    PrismaModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ClientesModule,
    ModeloCasaModule,
    VendasModule,
    MovimentacaoModule,
    MateriaPrimaModule,
    FinanceiroModule,
    ProducaoModule,
    EntregasModule,
    PedidosCompraModule,
    NotasFiscaisModule,

    DashboardModule,
    PlacasModule,
    TramasModule,
    TiposPlacaModule,
    CortesModule,
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
