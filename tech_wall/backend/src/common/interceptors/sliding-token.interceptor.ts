import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class SlidingTokenInterceptor implements NestInterceptor {
  constructor(private readonly jwtService: JwtService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    return next.handle().pipe(
      switchMap(async (data) => {
        // req.user has the decoded JWT payload from JwtStrategy
        const user = req.user as any;

        // Verifica se a rota possui usuário autenticado
        if (user && user.exp && user.absoluteExp) {
          const now = Date.now();
          const expMs = user.exp * 1000; // JWT exp está em segundos
          const timeRemaining = expMs - now;

          // O tempo de vida total do JWT é baseado no JWT_EXPIRATION
          // Vamos assumir 24h = 86400000ms. A "meia-vida" seria 12h.
          // Para ser genérico, se faltar menos de 12 horas, renova.
          // Uma forma melhor é calcular dinamicamente baseado na config,
          // mas hardcoded 12h para o "sliding" funciona se a exp for 24h.
          const halfLifetime = 12 * 60 * 60 * 1000;

          // Se faltar menos que a meia-vida para expirar e o absoluteExp ainda estiver válido
          if (timeRemaining < halfLifetime && now < user.absoluteExp) {
            // Gerar novo token preservando o absoluteExp
            const newPayload = {
              sub: user.id,
              roles: user.roles,
              absoluteExp: user.absoluteExp,
            };

            const newToken = await this.jwtService.signAsync(newPayload, {
              secret: process.env.JWT_SECRET,
              expiresIn: process.env.JWT_EXPIRATION as any,
            });

            const sameSite = (process.env.COOKIE_SAME_SITE || 'Lax') as
              'lax' | 'strict' | 'none';
            const secure = process.env.COOKIE_SECURE === 'true';

            res.cookie('access_token', newToken, {
              httpOnly: true,
              secure,
              sameSite,
              path: '/',
            });
          }
        }
        return data;
      }),
    );
  }
}
