import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthenticatedUser, RefreshTokenUser } from '../types/express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import { RefreshTokenGuard } from './refresh-token.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.login, body.senha);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.authService.login(user);
  }

  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshToken(@Req() req: Request) {
    const user = req.user as RefreshTokenUser;
    return this.authService.refreshToken(user.sub, user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Req() req: Request) {
    const user = req.user as AuthenticatedUser;
    return this.authService.logout(user.id);
  }
}
