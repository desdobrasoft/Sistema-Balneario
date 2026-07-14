import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  ParseIntPipe,
} from '@nestjs/common';
import { DataTableParamsDto } from '../common/dto/data-table.dto';
import { CreateMateriaPrimaDto } from './dto/create-materia-prima.dto';
import { UpdateMateriaPrimaDto } from './dto/update-materia-prima.dto';
import { MateriaPrimaService } from './materia-prima.service';

@Controller('materia-prima')
export class MateriaPrimaController {
  constructor(private readonly materiaPrimaService: MateriaPrimaService) {}

  @Post()
  create(@Body() createMateriaPrimaDto: CreateMateriaPrimaDto) {
    return this.materiaPrimaService.create(createMateriaPrimaDto);
  }

  @Get()
  findAll() {
    return this.materiaPrimaService.findAllRaw();
  }

  @Get('dashboard-stats')
  getDashboardStats() {
    return this.materiaPrimaService.getDashboardStats();
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(@Body() body: DataTableParamsDto) {
    const result = await this.materiaPrimaService.findAll(body);

    return {
      draw: body.draw || 1,
      recordsTotal: result.recordsTotal,
      recordsFiltered: result.recordsFiltered,
      data: result.data,
    };
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materiaPrimaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMateriaPrimaDto: UpdateMateriaPrimaDto,
  ) {
    return this.materiaPrimaService.update(id, updateMateriaPrimaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materiaPrimaService.remove(id);
  }
}
