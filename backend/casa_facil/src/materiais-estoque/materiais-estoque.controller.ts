import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { MateriaisEstoqueService } from './materiais-estoque.service';

@UseGuards(JwtAuthGuard)
@Controller('materiais-estoque')
export class MateriaisEstoqueController {
  constructor(private readonly service: MateriaisEstoqueService) {}

  @Post()
  @Roles('admin', 'estoquista')
  create(@Body(ValidationPipe) dto: CreateMaterialDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'estoquista')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) dto: UpdateMaterialDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
