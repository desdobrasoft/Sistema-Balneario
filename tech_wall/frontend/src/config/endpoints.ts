export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    CURRENT_USER: "/me",
  },
  USERS: "/users",
  ROLES: "/roles",
  CLIENTES: "/clientes",
  MODELO_CASA: "/modelo-casa",
  VENDAS: "/vendas",
  MOVIMENTACAO_MATERIAIS: "/movimentacoes-materiais",
  MATERIA_PRIMA: "/materia-prima",
  LANCAMENTOS: "/financeiro/lancamentos",
  PRODUCAO: "/producao",
  ENTREGAS: "/entregas",
  RECEBIMENTOS: "/recebimentos",
  PEDIDOS_COMPRA: "/pedidos-compra",
  NOTAS_FISCAIS: "/notas-fiscais",
  PLACAS: "/placas",
  CORTES: "/cortes",
  TRAMAS: "/tramas",
  TIPOS_PLACA: "/tipos-placa",
  TIPOS_MATERIAIS: "/tipos-materiais",
  DASHBOARD: {
    MAIN: "/dashboard",
    STATS: "/dashboard/stats",
  },
  DATATABLE: "/datatable",
};
