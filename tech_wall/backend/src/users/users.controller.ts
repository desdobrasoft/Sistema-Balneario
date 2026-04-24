import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
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
import { RolesGuard } from '../auth/roles.guard';
import { DataTableParamsDto } from '../common/dto/data-table.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body(new ValidationPipe({ skipMissingProperties: true }))
    dto: CreateUserDto,
  ) {
    return this.usersService.createUser(dto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Post('datatable')
  @HttpCode(200)
  async datatable(@Body() body: DataTableParamsDto) {
    const result = await this.usersService.findDatatable(body);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findByIdWithRoles(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  @Patch(':id')
  @Roles() // Sobrescreve o @Roles da classe, permitindo que a lógica interna decida (isSelf ou isAdmin)
  async update(
    @CurrentUser() currentUser: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const isSelf = currentUser.id === id;
    const isAdmin = currentUser.roles.includes('admin');

    if (!isSelf && !isAdmin) {
      throw new ForbiddenException(
        'Apenas administradores podem editar outros usuários.',
      );
    }

    if (isSelf && !isAdmin) {
      return this.usersService.updateOwnUser(id, dto);
    }

    return this.usersService.updateUser(id, dto);
  }
}
