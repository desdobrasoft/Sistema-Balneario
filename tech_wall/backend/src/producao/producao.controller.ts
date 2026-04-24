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
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DataTableParamsDto } from '../common/dto/data-table.dto';
import { AlocacaoDto } from './dto/alocacao.dto';
import { CreateInternalOrderDto } from './dto/create-internal-order.dto';
import { UpdateOrdemProducaoDto } from './dto/update-ordem-producao.dto';
import { ProducaoService } from './producao.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('producao')
@Controller('producao')
export class ProducaoController {
  constructor(private readonly producaoService: ProducaoService) {}

  @Post('internal-order')
  createInternalOrder(@Body(ValidationPipe) dto: CreateInternalOrderDto) {
    return this.producaoService.createInternalOrder(dto);
  }

  /**
   * Retorna uma lista de todas as ordens de produção.
   */
  @Get()
  findAll() {
    return this.producaoService.findAll();
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(@Body() body: DataTableParamsDto) {
    const result = await this.producaoService.findDatatable(body);
    return result;
  }

  /**
   * Retorna os detalhes de uma ordem de produção específica.
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.producaoService.findOne(id);
  }

  /**
   * Atualiza o status, data de agendamento ou notas de uma ordem de produção.
   * Este é o principal endpoint para o gerente de produção.
   */
  @Patch(':id')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateOrdemProducaoDto: UpdateOrdemProducaoDto,
  ) {
    return this.producaoService.updateStatus(id, updateOrdemProducaoDto);
  }

  @Post(':id/finalizar')
  finalizarProducao(@Param('id', ParseIntPipe) id: number) {
    return this.producaoService.finalizarProducao(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.producaoService.remove(id);
  }

  @Get('requisitos/:reqId/compatible-plates')
  findCompatiblePlates(@Param('reqId', ParseIntPipe) reqId: number) {
    return this.producaoService.findCompatiblePlates(reqId);
  }

  @Post('alocar')
  alocarPlaca(@Body(ValidationPipe) dto: AlocacaoDto) {
    return this.producaoService.alocarPlaca(dto.requisitoId, dto.placaId);
  }

  @Post('desalocar')
  desalocarPlaca(@Body('requisitoId', ParseIntPipe) requisitoId: number) {
    return this.producaoService.desalocarPlaca(requisitoId);
  }
}
