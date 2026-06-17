import {
  Body,
  Controller,
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
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DataTableParamsDto } from '../common/dto/data-table.dto';
import { StatusVenda } from '../generated/prisma/client';
import { CreateVendaDto } from './dto/create-venda.dto';
import { RegistrarCompraSuprimentoDto } from './dto/registrar-compra-suprimento.dto';
import { UpdateVendaDto } from './dto/update-venda.dto';
import { VendasService } from './vendas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('vendas')
@Controller('vendas')
export class VendasController {
  constructor(private readonly service: VendasService) {}

  @Post()
  create(
    @Body(ValidationPipe) dto: CreateVendaDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.service.create(dto, user.id);
  }

  @Post(':id/suprimentos/comprar')
  @Roles('producao', 'vendas')
  registrarCompraSuprimento(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: RegistrarCompraSuprimentoDto,
  ) {
    return this.service.registrarCompraSuprimento(id, dto);
  }

  @Get()
  findAll(@Query('exclude_status') excludeStatus?: StatusVenda) {
    return this.service.findAll(excludeStatus);
  }

  @Get('report')
  async getReport(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getReportData(startDate, endDate);
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(
    @Body() body: DataTableParamsDto,
    @Query('exclude_status') excludeStatus?: StatusVenda,
  ) {
    const result = await this.service.findDatatable(body, excludeStatus);
    return result;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/customization')
  findCustomization(@Param('id', ParseIntPipe) id: number) {
    return this.service.findCustomization(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateVendaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post(':id/estornar')
  estornar(@Param('id', ParseIntPipe) id: number) {
    return this.service.estornar(id);
  }
}
