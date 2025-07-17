import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Pega as roles exigidas para a rota (ex: @Roles('admin'))
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Se nenhuma role for exigida na rota, o guard libera o acesso.
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Pega o objeto 'user' que foi injetado no request pelo JwtAuthGuard
    const { user } = context.switchToHttp().getRequest();

    // Se não houver usuário (improvável se o JwtAuthGuard estiver ativo)
    // ou se o usuário não tiver roles, nega o acesso.
    if (!user || !user.roles) {
      return false;
    }

    // Verifica se o usuário possui pelo menos uma das roles necessárias.
    return requiredRoles.some((role) => user.roles.includes(role));
  }
}
