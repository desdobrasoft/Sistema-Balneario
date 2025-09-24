import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    // Busca por um usuário no banco com username ou email correspondente à entrada de login.
    const user = await this.usersService.findByUsernameOrEmail(login);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    // Verifica se a senha criptografada corresponde à entrada de login.
    const isPasswordValid = await bcrypt.compare(senha, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha incorreta');
    }

    return user;
  }

  async login(user: any) {
    // Payload do Access Token (curto, com mais informações)
    const accessTokenPayload = {
      sub: user.id,
      roles: user.user_roles.map(
        (ur: { roles: { role: any } }) => ur.roles.role,
      ),
    };

    // Payload do Refresh Token (longo, com menos informações)
    const refreshTokenPayload = {
      sub: user.id,
    };

    // Gera os dois tokens em paralelo
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m', // Duração curta
      }),
      this.jwtService.signAsync(refreshTokenPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d', // Duração longa
      }),
    ]);

    // Salva o hash do refresh token no banco de dados para o usuário
    await this.updateRefreshTokenHash(user.id, refreshToken);

    // Retorna ambos os tokens para o front-end
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      success: true,
    };
  }

  async logout(userId: number) {
    // Remove o hash do refresh token do banco de dados
    return this.usersService.update(userId, { refresh_token_hash: null });
  }

  // Gera um novo access token usando o refresh token
  async refreshToken(userId: number, refreshToken: string) {
    const user = await this.usersService.findByIdWithRoles(userId);
    if (!user || !user.refresh_token_hash) {
      throw new ForbiddenException('Acesso Negado');
    }

    const tokensMatch = await bcrypt.compare(
      refreshToken,
      user.refresh_token_hash,
    );
    if (!tokensMatch) {
      throw new ForbiddenException('Acesso Negado');
    }

    // Gera um novo Access Token com o payload original
    const newAccessTokenPayload = {
      sub: user.id,
      roles: user.user_roles.map((ur) => ur.roles.role),
    };

    const newAccessToken = await this.jwtService.signAsync(
      newAccessTokenPayload,
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      },
    );

    return { access_token: newAccessToken };
  }

  // Faz o hash e salva o refresh token
  private async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, { refresh_token_hash: hash });
  }
}
