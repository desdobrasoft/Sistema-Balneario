/** Lista de módulos/permissões do sistema. */
export const APP_MODULES: Record<string, string> = {
  clientes: 'Clientes',
  placas: 'Placas',
  cortes: 'Cortes Paramétricos',
  tramas: 'Tramas e Texturas',
  modelos: 'Catálogo de Modelos',
  vendas: 'Vendas',
  producao: 'Produção',
  entregas: 'Entregas',
  estoque: 'Matéria-Prima',
  financeiro: 'Financeiro',
};

/** Lista de chaves de todos os módulos */
export const ALL_MODULE_KEYS = Object.keys(APP_MODULES);

/** Quantidade total de módulos */
export const TOTAL_MODULES = ALL_MODULE_KEYS.length;
