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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DataTableParamsDto } from '../common/dto/data-table.dto';
import { ActionEntregaDto, AgendarColetaDto } from './dto/entrega-actions.dto';
import { EntregasService } from './entregas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('entregas')
@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @Get()
  findAll() {
    return this.entregasService.findAll();
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(@Body() body: DataTableParamsDto) {
    const result = await this.entregasService.findDatatable(body);
    return result;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.entregasService.findOne(id);
  }

  @Post(':id/agendar-coleta')
  agendarColeta(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: AgendarColetaDto,
  ) {
    return this.entregasService.agendarColeta(
      id,
      dto.transportadora,
      dto.previsaoEntrega,
      dto.notas,
    );
  }

  @Patch(':id/editar-agendamento')
  editarAgendamento(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: AgendarColetaDto,
  ) {
    return this.entregasService.editarAgendamento(
      id,
      dto.transportadora,
      dto.previsaoEntrega,
      dto.notas,
    );
  }

  @Post(':id/iniciar')
  iniciarEntrega(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ActionEntregaDto,
  ) {
    return this.entregasService.iniciarEntrega(id, dto.notas);
  }

  @Post(':id/finalizar')
  finalizarEntrega(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ActionEntregaDto,
  ) {
    return this.entregasService.finalizarEntrega(id, dto.notas);
  }

  @Post(':id/cancelar')
  cancelarEntrega(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: ActionEntregaDto,
  ) {
    return this.entregasService.cancelarEntrega(id, dto.notas);
  }
}
