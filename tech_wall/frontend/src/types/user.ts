/**
 * Mapeamento centralizado dos módulos do sistema.
 * Chave = valor armazenado no banco | Valor = nome amigável para exibição.
 */
export const APP_MODULES: Record<string, string> = {
  clientes: "Clientes",
  placas: "Placas (Estoque)",
  cortes: "Cortes Paramétricos",
  tramas: "Tramas e Texturas",
  modelos: "Catálogo de Modelos",
  vendas: "Vendas",
  producao: "Produção",
  entregas: "Entregas",
  estoque: "Matéria-Prima",
  financeiro: "Financeiro",
};

/**
 * Permissões de módulo disponíveis no sistema
 */
export type AppModule = keyof typeof APP_MODULES;

export interface Role {
  id: number;
  role: string;
  permissions: string[];
}

export interface UserModel {
  id: number;
  fullName: string;
  username: string;
  email?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
}
