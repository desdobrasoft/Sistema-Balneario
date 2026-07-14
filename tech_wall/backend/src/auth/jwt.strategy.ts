import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token = null;
          if (req && req.cookies) {
            token = req.cookies['access_token'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: {
    sub: number;
    roles?: string[];
    exp: number;
    absoluteExp: number;
  }) {
    // Busque o usuário e roles do banco para o payload.sub (user id)
    const user = await this.usersService.findByIdWithRoles(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    // Verifica expiração absoluta
    if (Date.now() > payload.absoluteExp) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    // Inclui as roles, permissões e tempos de expiração no objeto retornado
    return {
      id: user.id,
      username: user.username ?? user.email,
      roles: user.roles.map((ur) => ur.role.role),
      permissions: user.roles.flatMap((ur) => ur.role.permissions || []),
      exp: payload.exp,
      absoluteExp: payload.absoluteExp,
    };
  }
}
