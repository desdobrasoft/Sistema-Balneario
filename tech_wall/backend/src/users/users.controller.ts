import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  async create(
    @Body(new ValidationPipe({ skipMissingProperties: true }))
    dto: CreateUserDto,
  ) {
    return this.usersService.createUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAllWithRoles();

    return users.map((user) => ({
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      roles: user.user_roles.map((ur) => ur.roles.role),
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
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

    return this.usersService.updateUser(id, dto);
  }
}
