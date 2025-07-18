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
    // Cria um payload com id e papéis (roles) do usuário
    const payload = {
      sub: user.id,
      roles: user.user_roles.map(
        (ur: { roles: { role: any } }) => ur.roles.role,
      ),
    };

    // Retorna o token de acesso codificado com o payload gerado.
    return {
      success: true,
      access_token: this.jwtService.sign(payload),
    };
  }
}
