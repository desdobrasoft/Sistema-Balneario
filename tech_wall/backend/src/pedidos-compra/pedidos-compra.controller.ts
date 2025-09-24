import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { AuthenticatedUser } from 'src/types/express';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { ReceberPedidoDto } from './dto/receber-pedido.dto';
import { PedidosCompraService } from './pedidos-compra.service';

@UseGuards(JwtAuthGuard)
@Controller('pedidos-compra')
export class PedidosCompraController {
  constructor(private readonly service: PedidosCompraService) {}

  @Post()
  @Roles('admin', 'financeiro')
  create(
    @Body(ValidationPipe) dto: CreatePedidoDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(dto, user.id);
  }

  @Get()
  @Roles('admin', 'financeiro', 'estoquista')
  findAll() {
    return this.service.findAll();
  }

  @Patch(':id/receber')
  @Roles('admin', 'estoquista')
  receber(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ReceberPedidoDto,
  ) {
    return this.service.receber(id, dto);
  }

  @Patch(':id/resolver')
  @Roles('admin', 'financeiro')
  resolver(@Param('id', ParseIntPipe) id: number) {
    return this.service.resolver(id);
  }
}
