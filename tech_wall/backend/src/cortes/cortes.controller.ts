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
import { CortesService } from './cortes.service';
import { CreateCorteDto, UpdateCorteDto } from './dto/corte.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('cortes')
@Controller('cortes')
export class CortesController {
  constructor(private readonly cortesService: CortesService) {}

  @Post()
  create(@Body() dto: CreateCorteDto) {
    return this.cortesService.create(dto);
  }

  @Get()
  findAll() {
    return this.cortesService.findAll();
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(@Body() body: DataTableParamsDto) {
    return this.cortesService.findDatatable(body);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cortesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCorteDto) {
    return this.cortesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cortesService.remove(id);
  }
}
