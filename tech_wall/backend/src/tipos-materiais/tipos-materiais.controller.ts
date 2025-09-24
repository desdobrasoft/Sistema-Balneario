import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { TiposMateriaisService } from './tipos-materiais.service';
import { CreateTipoMaterialDto } from './dto/create-tipo-material.dto';
import { UpdateTipoMaterialDto } from './dto/update-tipo-material.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('tipos-materiais')
export class TiposMateriaisController {
  constructor(private readonly tiposMateriaisService: TiposMateriaisService) {}

  @Post()
  @Roles('admin')
  create(@Body(ValidationPipe) createTipoMaterialDto: CreateTipoMaterialDto) {
    return this.tiposMateriaisService.create(createTipoMaterialDto);
  }

  @Get()
  findAll() {
    return this.tiposMateriaisService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiposMateriaisService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateTipoMaterialDto: UpdateTipoMaterialDto,
  ) {
    return this.tiposMateriaisService.update(id, updateTipoMaterialDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tiposMateriaisService.remove(id);
  }
}
