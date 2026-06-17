import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser() user: { id: number }) {
    const fullUser = await this.usersService.findByIdWithRoles(user.id);

    if (!fullUser) return null;

    // Retorna apenas os dados desejados
    // Unifica as permissões de todas as roles do usuário (sem duplicatas)
    const permissions = [
      ...new Set(fullUser.roles.flatMap((ur) => ur.role.permissions || [])),
    ];

    return {
      id: fullUser.id,
      fullName: fullUser.fullName,
      username: fullUser.username,
      email: fullUser.email,
      isActive: fullUser.isActive,
      createdAt: fullUser.createdAt,
      updatedAt: fullUser.updatedAt,
      roles: fullUser.roles.map((ur) => ur.role.role),
      permissions,
    };
  }

  @Patch()
  async updateProfile(
    @CurrentUser() user: { id: number },
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateOwnUser(user.id, dto);
  }
}
