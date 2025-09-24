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
import { UpdateEntregaDto } from './dto/update-entrega.dto';
import { EntregasService } from './entregas.service';

@UseGuards(JwtAuthGuard)
@Controller('entregas')
export class EntregasController {
  constructor(private readonly entregasService: EntregasService) {}

  @Get()
  @Roles('admin', 'logistica', 'vendedor')
  findAll() {
    return this.entregasService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'logistica', 'vendedor')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.entregasService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'logistica')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateEntregaDto,
  ) {
    return this.entregasService.update(id, dto);
  }
}
