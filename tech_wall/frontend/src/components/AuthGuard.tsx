import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { ENDPOINTS } from "config/endpoints";
import api from "services/api";
import { useAuthStore } from "store/authStore";

export const AuthGuard: React.FC = () => {
  const { isAuthenticated, isSessionExpired, setUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      api
        .get(ENDPOINTS.AUTH.CURRENT_USER)
        .then((res) => {
          setUser(res.data);
        })
        .catch((error) => {
          console.error("Failure to synchronize user:", error);
        });
    }
  }, [isAuthenticated, setUser]);

  if (isSessionExpired) {
    return <Navigate to="/sessao-expirada" replace />;
  }

  if (!isAuthenticated) {
    // Redireciona para o login salvando a intenção de rota
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const GuestGuard: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    // Redireciona usuários logados para a home se tentarem acessar o login
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

/**
 * Guard de permissão por módulo.
 * Verifica se o usuário tem a permissão necessária para acessar a rota.
 * Admins passam direto. Sem permissão → redireciona ao Dashboard.
 */
export const PermissionGuard: React.FC<{ permission: string }> = ({
  permission,
}) => {
  const { user } = useAuthStore();

  // Se os dados do usuário ainda não carregaram, renderiza normalmente
  // (o AuthGuard pai já garante que o usuário está autenticado)
  if (!user) return <Outlet />;

  const isAdmin = user.roles?.includes("admin") ?? false;
  const hasPermission = user.permissions?.includes(permission) ?? false;

  if (isAdmin || hasPermission) {
    return <Outlet />;
  }

  // Sem permissão → redireciona ao Dashboard
  return <Navigate to="/" replace />;
};

