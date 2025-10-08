import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode } from '@nestjs/common';
import { PlacasService } from './placas.service';
import { CreatePlacaDto } from './dto/create-placa.dto';
import { UpdatePlacaDto } from './dto/update-placa.dto';
import { GerenciarProducaoPlacaDto } from './dto/gerenciar-producao-placa.dto';
import { BaixaProducaoPlacaDto } from './dto/baixa-producao-placa.dto';

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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.placasService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePlacaDto: UpdatePlacaDto) {
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

  @Post(':id/baixa-producao')
  @HttpCode(200)
  baixaProducao(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BaixaProducaoPlacaDto,
  ) {
    return this.placasService.baixaProducao(id, dto);
  }
}
