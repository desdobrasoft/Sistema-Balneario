import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UpdateOrdemProducaoDto } from './dto/update-ordem-producao.dto';
import { ProducaoService } from './producao.service';

@UseGuards(JwtAuthGuard)
@Controller('producao')
export class ProducaoController {
  constructor(private readonly producaoService: ProducaoService) {}

  /**
   * Retorna uma lista de todas as ordens de produção.
   */
  @Get()
  @Roles('admin', 'producao', 'vendedor') // Vendedores podem querer ver o status
  findAll() {
    return this.producaoService.findAll();
  }

  /**
   * Retorna os detalhes de uma ordem de produção específica.
   */
  @Get(':id')
  @Roles('admin', 'producao', 'vendedor')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.producaoService.findOne(id);
  }

  /**
   * Atualiza o status, data de agendamento ou notas de uma ordem de produção.
   * Este é o principal endpoint para o gerente de produção.
   */
  @Patch(':id')
  @Roles('admin', 'producao') // Apenas admin e produção podem alterar
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateOrdemProducaoDto: UpdateOrdemProducaoDto,
  ) {
    return this.producaoService.updateStatus(id, updateOrdemProducaoDto);
  }
}
