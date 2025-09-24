import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from 'src/users/users.service';

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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    // Busque o usuário e roles do banco para o payload.sub (user id)
    const user = await this.usersService.findByIdWithRoles(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    // Inclui as roles no objeto retornado para ser usado no request.user
    return {
      id: user.id,
      username: user.username ?? user.email,
      roles: user.user_roles.map((ur) => ur.roles.role),
    };
  }
}
