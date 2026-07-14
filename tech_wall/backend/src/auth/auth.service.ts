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

    const isPasswordValid = await bcrypt.compare(senha, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    return user;
  }

  async login(user: {
    id: number;
    roles: { role: { role: string } }[];
    username?: string | null;
    email?: string | null;
  }) {
    // Calculates absolute expiration based on env
    const absoluteExpStr = process.env.SESSION_ABSOLUTE_EXPIRATION || '30d';
    // Instead of using 'ms', let's do a basic parser or assume we'll just calculate it in the interceptor
    // Actually, NestJS jwt doesn't have absoluteExp standard. We add it to payload.
    // For simplicity, let's use a function to convert basic days/hours to ms.
    const absoluteExpMs = this.parseMs(absoluteExpStr);

    const accessTokenPayload = {
      sub: user.id,
      roles: user.roles.map((ur) => ur.role.role),
      absoluteExp: Date.now() + absoluteExpMs,
    };

    const accessToken = await this.jwtService.signAsync(accessTokenPayload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRATION as any,
    });

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles.map((ur) => ur.role.role),
        },
        access_token: accessToken, // We return it here, but AuthController will set it as cookie and remove from JSON response
      },
    };
  }

  logout() {
    // There is no refresh token in DB anymore, so logout is mostly client-side and clearing cookie.
    return { success: true };
  }

  // Helper to parse '30d', '24h' into milliseconds
  private parseMs(val: string): number {
    const match = val.match(/^(\d+)(d|h|m|s)$/);
    if (!match) return 30 * 24 * 60 * 60 * 1000; // default 30d
    const num = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 'd':
        return num * 24 * 60 * 60 * 1000;
      case 'h':
        return num * 60 * 60 * 1000;
      case 'm':
        return num * 60 * 1000;
      case 's':
        return num * 1000;
      default:
        return 30 * 24 * 60 * 60 * 1000;
    }
  }
}
