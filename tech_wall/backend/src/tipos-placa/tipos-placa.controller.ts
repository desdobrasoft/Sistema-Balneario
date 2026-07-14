import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { DataTableParamsDto } from '../common/dto/data-table.dto';
import { CreateTipoPlacaDto } from './dto/create-tipo-placa.dto';
import { UpdateTipoPlacaDto } from './dto/update-tipo-placa.dto';
import { TiposPlacaService } from './tipos-placa.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('placas')
@Controller('tipos-placa')
export class TiposPlacaController {
  constructor(private readonly tiposPlacaService: TiposPlacaService) {}

  @Post()
  create(@Body() createTipoPlacaDto: CreateTipoPlacaDto) {
    return this.tiposPlacaService.create(createTipoPlacaDto);
  }

  @Get()
  findAll() {
    return this.tiposPlacaService.findAll();
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(@Body() body: DataTableParamsDto) {
    const result = await this.tiposPlacaService.findDatatable(body);
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tiposPlacaService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTipoPlacaDto: UpdateTipoPlacaDto,
  ) {
    return this.tiposPlacaService.update(+id, updateTipoPlacaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tiposPlacaService.remove(+id);
  }
}
