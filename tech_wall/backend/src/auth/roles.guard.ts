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
    // ou se o usuário não tiver roles nem permissões, nega o acesso.
    if (!user || (!user.roles && !user.permissions)) {
      return false;
    }

    // Se o usuário tiver a role 'admin' vindo da tabela de roles (mantendo retrocompatibilidade), libera tudo.
    if (user.roles.includes('admin')) {
      return true;
    }

    // Verifica se o usuário possui pelo menos uma das permissões de módulo necessárias.
    // requiredRoles aqui passa a ser tratado como nomes de módulos (ex: 'clientes', 'vendas')
    return requiredRoles.some((permission) =>
      user.permissions.includes(permission),
    );
  }
}
