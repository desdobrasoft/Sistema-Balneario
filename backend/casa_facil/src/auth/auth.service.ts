import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(login: string, senha: string) {
    const user = await this.usersService.findByUsernameOrEmail(login);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const isPasswordValid = await bcrypt.compare(senha, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      roles: user.user_roles.map((ur) => ur.roles.role),
    };

    return {
      success: true,
      access_token: this.jwtService.sign(payload),
    };
  }
}
