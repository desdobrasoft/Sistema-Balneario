import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DataTableParamsDto } from '../common/dto/data-table.dto';
import { AplicarCorteDto } from './dto/aplicar-corte.dto';
import { CreatePlacaDto } from './dto/create-placa.dto';
import { GerenciarProducaoPlacaDto } from './dto/gerenciar-producao-placa.dto';
import { PlacaQueryDto } from './dto/placa-query.dto';
import { UpdatePlacaDto } from './dto/update-placa.dto';
import { PlacasService } from './placas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('placas')
@Controller('placas')
export class PlacasController {
  constructor(private readonly placasService: PlacasService) {}

  @Post()
  create(@Body() createPlacaDto: CreatePlacaDto) {
    return this.placasService.create(createPlacaDto);
  }

  @Get()
  findAll() {
    return this.placasService.findAll();
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(@Body() body: PlacaQueryDto) {
    const result = await this.placasService.findDatatable(body);
    return result;
  }

  @Post('estoque/datatable')
  @HttpCode(200)
  async estoqueDatatable(@Body() body: DataTableParamsDto) {
    return this.placasService.findEstoqueDatatable(body);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.placasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlacaDto: UpdatePlacaDto,
  ) {
    return this.placasService.update(id, updatePlacaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.placasService.remove(id);
  }

  @Post(':id/gerenciar-producao')
  gerenciarProducao(
    @Param('id', ParseIntPipe) id: number,
    @Body() gerenciarProducaoPlacaDto: GerenciarProducaoPlacaDto,
  ) {
    return this.placasService.gerenciarProducao(id, gerenciarProducaoPlacaDto);
  }

  // ===== APLICAR CORTE EM PLACA =====

  @Post(':id/aplicar-corte')
  @Roles('cortes')
  aplicarCorte(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AplicarCorteDto,
  ) {
    return this.placasService.aplicarCorte(id, dto);
  }

  @Get(':id/cortes-aplicados')
  @Roles('cortes')
  findCortesAplicados(@Param('id', ParseIntPipe) id: number) {
    return this.placasService.findCortesAplicados(id);
  }

  @Delete(':id/corte-aplicado')
  @Roles('cortes')
  removerCorteAplicado(@Param('id', ParseIntPipe) id: number) {
    return this.placasService.removerCorteAplicado(id);
  }

  // ===== STATUS DE PLACA =====

  @Patch(':id/status')
  updateStatusPlaca(
    @Param('id', ParseIntPipe) id: number,
    @Body('statusPlaca') statusPlaca: string,
  ) {
    return this.placasService.updateStatusPlaca(id, statusPlaca);
  }
}
