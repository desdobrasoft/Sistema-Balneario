// Auto-generated from schema.prisma

export const ReforcoPlaca = {
  DOIS_P: 'DOIS_P',
  S_P: 'S_P',
  UM_P: 'UM_P',
} as const;
export type ReforcoPlaca = (typeof ReforcoPlaca)[keyof typeof ReforcoPlaca];

export const StatusEntrega = {
  ATRASADA: 'ATRASADA',
  CANCELADA: 'CANCELADA',
  COLETA_AGENDADA: 'COLETA_AGENDADA',
  EM_TRANSITO: 'EM_TRANSITO',
  ENTREGUE: 'ENTREGUE',
  PENDENTE_TRANSPORTADORA: 'PENDENTE_TRANSPORTADORA',
} as const;
export type StatusEntrega = (typeof StatusEntrega)[keyof typeof StatusEntrega];

export const StatusPagamentoVenda = {
  CANCELADO: 'CANCELADO',
  PAGO: 'PAGO',
  PAGO_PARCIALMENTE: 'PAGO_PARCIALMENTE',
  PENDENTE: 'PENDENTE',
  VENCIDO: 'VENCIDO',
} as const;
export type StatusPagamentoVenda = (typeof StatusPagamentoVenda)[keyof typeof StatusPagamentoVenda];

export const StatusPedidoCompra = {
  COMPRADO: 'COMPRADO',
  ENTREGUE: 'ENTREGUE',
  ENTREGUE_COM_ALTERACAO: 'ENTREGUE_COM_ALTERACAO',
  RESOLVIDO: 'RESOLVIDO',
  SOLICITADO: 'SOLICITADO',
} as const;
export type StatusPedidoCompra = (typeof StatusPedidoCompra)[keyof typeof StatusPedidoCompra];

export const StatusPlaca = {
  ALOCADA: 'ALOCADA',
  DESCARTADA: 'DESCARTADA',
  DISPONIVEL: 'DISPONIVEL',
} as const;
export type StatusPlaca = (typeof StatusPlaca)[keyof typeof StatusPlaca];

export const StatusProducao = {
  AGENDADO: 'AGENDADO',
  CANCELADO: 'CANCELADO',
  EM_ESPERA: 'EM_ESPERA',
  MATERIAIS_PENDENTES: 'MATERIAIS_PENDENTES',
  MONTANDO_KIT: 'MONTANDO_KIT',
  PREPARANDO_MATERIAIS: 'PREPARANDO_MATERIAIS',
  PRONTO_PARA_ENVIO: 'PRONTO_PARA_ENVIO',
} as const;
export type StatusProducao = (typeof StatusProducao)[keyof typeof StatusProducao];

export const StatusProducaoPlaca = {
  AGUARDANDO: 'AGUARDANDO',
  EM_PRODUCAO: 'EM_PRODUCAO',
  FINALIZADA: 'FINALIZADA',
} as const;
export type StatusProducaoPlaca = (typeof StatusProducaoPlaca)[keyof typeof StatusProducaoPlaca];

export const StatusVenda = {
  AGUARDANDO_AGENDAMENTO_PRODUCAO: 'AGUARDANDO_AGENDAMENTO_PRODUCAO',
  AGUARDANDO_REPOSICAO_ESTOQUE: 'AGUARDANDO_REPOSICAO_ESTOQUE',
  CANCELADA: 'CANCELADA',
  ENTREGUE: 'ENTREGUE',
  ENVIADO: 'ENVIADO',
  KIT_EM_PREPARACAO: 'KIT_EM_PREPARACAO',
  MATERIAIS_ALOCADOS: 'MATERIAIS_ALOCADOS',
  PRODUCAO_AGENDADA: 'PRODUCAO_AGENDADA',
  PRONTO_PARA_ENVIO: 'PRONTO_PARA_ENVIO',
} as const;
export type StatusVenda = (typeof StatusVenda)[keyof typeof StatusVenda];

export const TipoLancamento = {
  D: 'D',
  R: 'R',
} as const;
export type TipoLancamento = (typeof TipoLancamento)[keyof typeof TipoLancamento];

export const TipoRequisito = {
  CORTE_ESPECIFICO: 'CORTE_ESPECIFICO',
  PLACA_LISA: 'PLACA_LISA',
} as const;
export type TipoRequisito = (typeof TipoRequisito)[keyof typeof TipoRequisito];

export interface Cliente {
  createdAt?: string | null;
  email?: string | null;
  historicoVendas?: number | null;
  id: number;
  isInternal: boolean;
  nome: string;
  nroContato?: string | null;
  updatedAt?: string | null;
  vendas: Venda[];
}

export interface Corte {
  altura: number | string;
  createdAt: string;
  deletedAt?: string | null;
  id: number;
  largura: number | string;
  nome: string;
  percurso: Record<string, unknown> | unknown[];
  placasGeradas: Placa[];
  pontos?: Record<string, unknown> | unknown[] | null;
  requisitosModelo: RequisitoModeloCasa[];
  updatedAt: string;
  vendaRequisitos: VendaRequisito[];
}

export interface Entrega {
  createdAt?: string | null;
  enderecoEntrega: string;
  entregasHistorico: EntregaHistorico[];
  id: number;
  previsaoEntrega: string;
  status: StatusEntrega;
  transportadora?: string | null;
  updatedAt?: string | null;
  venda: Venda;
  vendaId: number;
}

export interface EntregaHistorico {
  dataAlteracao?: string | null;
  entrega: Entrega;
  entregaId: number;
  id: number;
  notas?: string | null;
  statusAnterior?: StatusEntrega | null;
  statusNovo: StatusEntrega;
}

export interface LancamentoFinanceiro {
  createdAt?: string | null;
  dataUltimoPagamento?: string | null;
  dataVencimento?: string | null;
  descricao?: string | null;
  id: number;
  movimentacaoMaterial?: MovimentacaoMaterial | null;
  movimentacaoMaterialId?: number | null;
  notasFiscais: NotaFiscalLancamento[];
  statusPagamento: StatusPagamentoVenda;
  tipo: TipoLancamento;
  updatedAt?: string | null;
  valorPendente: number | string;
  valorTotal: number | string;
  venda?: Venda | null;
  vendaId?: number | null;
}

export interface MaterialModeloCasa {
  materiaPrima: MateriaPrima;
  materiaPrimaId: number;
  modeloCasa: ModeloCasa;
  modeloCasaId: number;
  qtModelo: number;
}

export interface MaterialTipoPlaca {
  materiaPrima: MateriaPrima;
  materiaPrimaId: number;
  quantidade: number;
  tipoPlaca: TipoPlaca;
  tipoPlacaId: number;
}

export interface MateriaPrima {
  deletedAt?: string | null;
  estoqueMinimo?: number | null;
  id: number;
  item: string;
  materiaisModeloCasa: MaterialModeloCasa[];
  materiaisTipoPlaca: MaterialTipoPlaca[];
  movimentacaoMateriais: MovimentacaoMaterial[];
  pedidosCompra: PedidoCompra[];
  quantidade: number;
  unidade?: string | null;
  vendaItensOverride: VendaItemOverride[];
}

export interface ModeloCasa {
  createdAt?: string | null;
  deletedAt?: string | null;
  descricao?: string | null;
  id: number;
  imagemBase64?: string | null;
  materiaisModeloCasa: MaterialModeloCasa[];
  nome: string;
  preco: number | string;
  qtVendido?: number | null;
  requisitos: RequisitoModeloCasa[];
  suprimentosObra?: Record<string, unknown> | unknown[] | null;
  tempoFabricacao: number;
  updatedAt?: string | null;
  vendas: Venda[];
}

export interface MovimentacaoMaterial {
  createdAt?: string | null;
  dataMovimentacao: string;
  fornecedor?: string | null;
  id: number;
  lancamentosFinanceiros: LancamentoFinanceiro[];
  materiaPrima: MateriaPrima;
  materiaPrimaId: number;
  notas?: string | null;
  qtde: number;
  tipoMovimentacao: string;
  user?: User | null;
  userId?: number | null;
}

export interface NotaFiscal {
  arquivoBase64: string;
  createdAt?: string | null;
  id: number;
  lancamentos: NotaFiscalLancamento[];
  nomeArquivo: string;
  tipoArquivo: string;
}

export interface NotaFiscalLancamento {
  id: number;
  lancamento: LancamentoFinanceiro;
  lancamentoId: number;
  notaFiscal: NotaFiscal;
  notaFiscalId: number;
}

export interface OrdemProducao {
  createdAt?: string | null;
  dataAgendamento?: string | null;
  id: number;
  ordensProducaoHistorico: OrdemProducaoHistorico[];
  status: StatusProducao;
  updatedAt?: string | null;
  venda: Venda;
  vendaId: number;
}

export interface OrdemProducaoHistorico {
  dataAlteracao?: string | null;
  id: number;
  notas?: string | null;
  ordemProducao: OrdemProducao;
  ordemProducaoId: number;
  statusAnterior?: StatusProducao | null;
  statusNovo: StatusProducao;
}

export interface PedidoCompra {
  createdAt?: string | null;
  dataPedido?: string | null;
  fornecedor?: string | null;
  id: number;
  materiaPrima: MateriaPrima;
  materiaPrimaId: number;
  qtEntregue?: number | null;
  qtSolicitada: number;
  status: StatusPedidoCompra;
  updatedAt?: string | null;
  user?: User | null;
  userId?: number | null;
  valorUnitario?: number | string | null;
}

export interface Placa {
  corteOrigemX?: number | string | null;
  corteOrigemY?: number | string | null;
  corteRotacao?: number | null;
  deletedAt?: string | null;
  derivadaDe?: Placa | null;
  derivadaDePlacaId?: number | null;
  descricao?: string | null;
  formaCorte?: Corte | null;
  formaCorteId?: number | null;
  id: number;
  materiaisConsumidos?: Record<string, unknown> | unknown[] | null;
  nome: string;
  placasDerivadas: Placa[];
  statusPlaca: StatusPlaca;
  statusProducao: StatusProducaoPlaca;
  tipoPlaca: TipoPlaca;
  tipoPlacaId: number;
  updatedAt?: string | null;
  vendaRequisitos: VendaRequisito[];
}

export interface RequisitoModeloCasa {
  alias?: string | null;
  corte?: Corte | null;
  corteId?: number | null;
  id: number;
  modeloCasa: ModeloCasa;
  modeloCasaId: number;
  parede: string;
  tipo: TipoRequisito;
  tipoPlaca: TipoPlaca;
  tipoPlacaId: number;
}

export interface Role {
  id: number;
  permissions: string[];
  role: string;
  users: UserRole[];
}

export interface TipoPlaca {
  altura: number | string;
  createdAt: string;
  deletedAt?: string | null;
  espessura: number | string;
  id: number;
  largura: number | string;
  materiais: MaterialTipoPlaca[];
  nome: string;
  placas: Placa[];
  reforco: ReforcoPlaca;
  requisitosModeloCasa: RequisitoModeloCasa[];
  tramaDireita?: Trama | null;
  tramaDireitaAtiva: boolean;
  tramaDireitaId?: number | null;
  tramaEsquerda?: Trama | null;
  tramaEsquerdaAtiva: boolean;
  tramaEsquerdaId?: number | null;
  tramaInferior?: Trama | null;
  tramaInferiorAtiva: boolean;
  tramaInferiorId?: number | null;
  tramaSuperior?: Trama | null;
  tramaSuperiorAtiva: boolean;
  tramaSuperiorId?: number | null;
  updatedAt: string;
  vendaRequisitos: VendaRequisito[];
}

export interface Trama {
  alturaBase: number | string;
  cortes: Record<string, unknown> | unknown[];
  createdAt?: string | null;
  direcionamento: string;
  id: number;
  iniciaComSaliencia: boolean;
  nome: string;
  profundidadeSaliencia: number | string;
  tipoPlacaDireita: TipoPlaca[];
  tipoPlacaEsquerda: TipoPlaca[];
  tipoPlacaInferior: TipoPlaca[];
  tipoPlacaSuperior: TipoPlaca[];
  updatedAt?: string | null;
}

export interface User {
  createdAt?: string | null;
  email?: string | null;
  fullName?: string | null;
  id: number;
  isActive?: boolean | null;
  movimentacaoMateriais: MovimentacaoMaterial[];
  passwordHash: string;
  pedidosCompra: PedidoCompra[];
  qtVendas?: number | null;
  refreshTokenHash?: string | null;
  roles: UserRole[];
  updatedAt?: string | null;
  username?: string | null;
  vendas: Venda[];
}

export interface UserRole {
  role: Role;
  roleId: number;
  user: User;
  userId: number;
}

export interface Venda {
  cliente?: Cliente | null;
  clienteId?: number | null;
  createdAt?: string | null;
  dataVenda: string;
  enderecoEntrega: string;
  entrega?: Entrega | null;
  id: number;
  isInternal: boolean;
  lancamentosFinanceiros: LancamentoFinanceiro[];
  modeloCasa?: ModeloCasa | null;
  modeloId?: number | null;
  ordemProducao?: OrdemProducao | null;
  preco: number | string;
  status: StatusVenda;
  statusPagamento: StatusPagamentoVenda;
  suprimentosObra?: Record<string, unknown> | unknown[] | null;
  user?: User | null;
  userId?: number | null;
  vendaItensOverride: VendaItemOverride[];
  vendaRequisitos: VendaRequisito[];
  vendasHistorico: VendaHistorico[];
  vendaSuprimentos: VendaSuprimentoOverride[];
}

export interface VendaHistorico {
  dataAlteracao?: string | null;
  id: number;
  statusAnterior?: StatusVenda | null;
  statusNovo: StatusVenda;
  venda: Venda;
  vendaId: number;
}

export interface VendaItemOverride {
  id: number;
  materiaPrima: MateriaPrima;
  materiaPrimaId: number;
  qtFinal: number;
  venda: Venda;
  vendaId: number;
}

export interface VendaRequisito {
  alias?: string | null;
  corte?: Corte | null;
  corteId?: number | null;
  id: number;
  parede: string;
  placaAlocada?: Placa | null;
  placaAlocadaId?: number | null;
  tipo: TipoRequisito;
  tipoPlaca: TipoPlaca;
  tipoPlacaId: number;
  venda: Venda;
  vendaId: number;
}

export interface VendaSuprimentoOverride {
  id: number;
  momento?: string | null;
  nome: string;
  quantidade: number;
  unidade: string;
  venda: Venda;
  vendaId: number;
}

