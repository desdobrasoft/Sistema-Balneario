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
import { CreateTramaDto } from './dto/create-trama.dto';
import { UpdateTramaDto } from './dto/update-trama.dto';
import { TramasService } from './tramas.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('tramas')
@Controller('tramas')
export class TramasController {
  constructor(private readonly tramasService: TramasService) {}

  @Post()
  create(@Body() createTramaDto: CreateTramaDto) {
    return this.tramasService.create(createTramaDto);
  }

  @Get()
  findAll() {
    return this.tramasService.findAll();
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(@Body() body: DataTableParamsDto) {
    const result = await this.tramasService.findDatatable(body);
    return result;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tramasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTramaDto: UpdateTramaDto) {
    return this.tramasService.update(+id, updateTramaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tramasService.remove(+id);
  }
}
