import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.login, body.senha);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const loginResult = await this.authService.login(user);
    const token = loginResult.data.access_token;

    // Configura os cookies a partir das variáveis de ambiente
    const sameSite = (process.env.COOKIE_SAME_SITE || 'Lax') as
      'lax' | 'strict' | 'none';
    const secure = process.env.COOKIE_SECURE === 'true';

    res.cookie('access_token', token, {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    // Removemos o token da resposta JSON para forçar o uso do cookie
    return {
      success: true,
      data: {
        user: loginResult.data.user,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    this.authService.logout();

    const sameSite = (process.env.COOKIE_SAME_SITE || 'Lax') as
      'lax' | 'strict' | 'none';
    const secure = process.env.COOKIE_SECURE === 'true';

    res.clearCookie('access_token', {
      httpOnly: true,
      secure,
      sameSite,
      path: '/',
    });

    return { success: true };
  }
}
