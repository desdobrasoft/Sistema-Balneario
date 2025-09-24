import {
  Body,
  Controller,
  Get,
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
import { status_venda } from '@prisma/client';
import { CreateVendaDto } from './dto/create-venda.dto';
import { UpdateVendaDto } from './dto/update-venda.dto';
import { VendasService } from './vendas.service';

@UseGuards(JwtAuthGuard)
@Controller('vendas')
export class VendasController {
  constructor(private readonly service: VendasService) {}

  @Post()
  @Roles('admin', 'vendas')
  create(@Body(ValidationPipe) dto: CreateVendaDto, @CurrentUser() user: any) {
    return this.service.create(dto, user.id);
  }

  @Get()
  @Roles('admin', 'vendas', 'estoque', 'dashboard')
  findAll(@Query('exclude_status') excludeStatus?: status_venda) {
    return this.service.findAll(excludeStatus);
  }

  @Get(':id')
  @Roles('admin', 'vendas', 'estoque')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Get(':id/customization')
  @Roles('admin', 'vendas', 'estoque')
  findCustomization(@Param('id', ParseIntPipe) id: number) {
    return this.service.findCustomization(id);
  }

  @Patch(':id')
  @Roles('admin', 'vendas')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateVendaDto,
  ) {
    return this.service.update(id, dto);
  }

  @Post(':id/estornar')
  @Roles('admin')
  estornar(@Param('id', ParseIntPipe) id: number) {
    return this.service.estornar(id);
  }
}
