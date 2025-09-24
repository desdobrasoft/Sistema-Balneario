import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser() user: any) {
    const fullUser = await this.usersService.findByIdWithRoles(user.id);

    if (!fullUser) return null;

    // Retorna apenas os dados desejados
    return {
      id: fullUser.id,
      full_name: fullUser.full_name,
      username: fullUser.username,
      email: fullUser.email,
      is_active: fullUser.is_active,
      created_at: fullUser.created_at,
      updated_at: fullUser.updated_at,
      roles: fullUser.user_roles.map((ur) => ur.roles.role),
    };
  }

  @Patch()
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateUserDto) {
    return this.usersService.updateOwnUser(user.id, dto);
  }
}
