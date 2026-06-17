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
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { DataTableParamsDto } from '../../common/dto/data-table.dto';
import { CreateLancamentoDto } from './dto/create-lancamento.dto';
import { UpdateLancamentoDto } from './dto/update-lancamento.dto';
import { LancamentosService } from './lancamentos.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('financeiro')
@Controller('financeiro/lancamentos')
export class LancamentosController {
  constructor(private readonly service: LancamentosService) {}

  @Post()
  create(@Body(ValidationPipe) dto: CreateLancamentoDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAllRaw();
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(@Body() body: DataTableParamsDto) {
    return this.service.findDatatable(body);
  }

  @Get('report')
  async getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.service.getReportData(startDate, endDate, tipo);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateLancamentoDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
