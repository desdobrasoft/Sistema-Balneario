import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto';
import { UpdateMovimentacaoDto } from './dto/update-movimentacao.dto';
import { MovimentacaoService } from './movimentacao.service';

@UseGuards(JwtAuthGuard) // Protege todas as rotas do controller
@Roles('admin', 'estoque') // Exemplo de roles que podem acessar
@Controller('movimentacoes-materiais')
export class MovimentacaoController {
  constructor(private readonly service: MovimentacaoService) {}

  @Post()
  create(
    @Body(ValidationPipe) dto: CreateMovimentacaoDto,
    @CurrentUser() user: any,
  ) {
    return this.service.create(dto, user.id);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateMovimentacaoDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
