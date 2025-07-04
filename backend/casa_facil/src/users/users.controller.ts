import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    const users = await this.usersService.findAllWithRoles();

    return users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      roles: user.user_roles.map((ur) => ur.roles.role),
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }
}
