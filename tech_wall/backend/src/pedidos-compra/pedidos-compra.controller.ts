import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DataTableParamsDto } from '../common/dto/data-table.dto';
import type { AuthenticatedUser } from '../types/express';
import { ComprarPedidoDto } from './dto/comprar-pedido.dto';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { ReceberPedidoDto } from './dto/receber-pedido.dto';
import { PedidosCompraService } from './pedidos-compra.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pedidos-compra')
export class PedidosCompraController {
  constructor(private readonly service: PedidosCompraService) {}

  // Estoquista ou financeiro pode criar pedido
  @Post()
  @Roles('estoque', 'financeiro')
  create(
    @Body(ValidationPipe) dto: CreatePedidoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(dto, user);
  }

  @Get()
  @Roles('estoque', 'financeiro')
  findAll() {
    return this.service.findAll();
  }

  @Post('datatable')
  @HttpCode(200)
  @Roles('estoque', 'financeiro')
  async datatable(@Body() body: DataTableParamsDto) {
    return this.service.findDatatable(body);
  }

  // Financeiro marca como comprado e define valor/fornecedor
  @Patch(':id/comprar')
  @Roles('financeiro')
  comprar(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ComprarPedidoDto,
  ) {
    return this.service.comprar(id, dto);
  }

  // Estoquista confirma recebimento (pedido deve estar COMPRADO)
  @Patch(':id/receber')
  @Roles('estoque')
  receber(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ReceberPedidoDto,
  ) {
    return this.service.receber(id, dto);
  }

  // Financeiro resolve pedido com alteração
  @Patch(':id/resolver')
  @Roles('financeiro')
  resolver(@Param('id', ParseIntPipe) id: number) {
    return this.service.resolver(id);
  }
}
