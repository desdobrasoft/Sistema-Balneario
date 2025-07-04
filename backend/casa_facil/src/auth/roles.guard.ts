import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true; // Sem roles exigidas, libera acesso
    }
    const { user } = context.switchToHttp().getRequest();

    // user.roles deve estar preenchido pelo JwtStrategy (veja nota abaixo)
    if (!user || !user.roles) return false;

    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
