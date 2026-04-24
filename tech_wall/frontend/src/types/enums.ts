export const StatusVenda = {
  AGUARDANDO_AGENDAMENTO_PRODUCAO: "AGUARDANDO_AGENDAMENTO_PRODUCAO",
  PRODUCAO_AGENDADA: "PRODUCAO_AGENDADA",
  KIT_EM_PREPARACAO: "KIT_EM_PREPARACAO",
  MATERIAIS_ALOCADOS: "MATERIAIS_ALOCADOS",
  PRONTO_PARA_ENVIO: "PRONTO_PARA_ENVIO",
  ENVIADO: "ENVIADO",
  ENTREGUE: "ENTREGUE",
  AGUARDANDO_REPOSICAO_ESTOQUE: "AGUARDANDO_REPOSICAO_ESTOQUE",
  CANCELADA: "CANCELADA",
} as const;
export type StatusVenda = (typeof StatusVenda)[keyof typeof StatusVenda];

export const StatusVendaLabels: Record<StatusVenda, string> = {
  [StatusVenda.AGUARDANDO_AGENDAMENTO_PRODUCAO]: "Aguardando Agendamento",
  [StatusVenda.PRODUCAO_AGENDADA]: "Produção Agendada",
  [StatusVenda.KIT_EM_PREPARACAO]: "Em Preparação",
  [StatusVenda.MATERIAIS_ALOCADOS]: "Materiais Alocados",
  [StatusVenda.PRONTO_PARA_ENVIO]: "Pronto para Envio",
  [StatusVenda.ENVIADO]: "Enviado",
  [StatusVenda.ENTREGUE]: "Entregue",
  [StatusVenda.AGUARDANDO_REPOSICAO_ESTOQUE]: "Aguardando Estoque",
  [StatusVenda.CANCELADA]: "Cancelada",
};

export const StatusProducao = {
  AGENDADO: "AGENDADO",
  MATERIAIS_PENDENTES: "MATERIAIS_PENDENTES",
  PREPARANDO_MATERIAIS: "PREPARANDO_MATERIAIS",
  MONTANDO_KIT: "MONTANDO_KIT",
  PRONTO_PARA_ENVIO: "PRONTO_PARA_ENVIO",
  EM_ESPERA: "EM_ESPERA",
  CANCELADO: "CANCELADO",
} as const;
export type StatusProducao =
  (typeof StatusProducao)[keyof typeof StatusProducao];

export const StatusProducaoLabels: Record<StatusProducao, string> = {
  [StatusProducao.AGENDADO]: "Agendado",
  [StatusProducao.MATERIAIS_PENDENTES]: "Materiais Pendentes",
  [StatusProducao.PREPARANDO_MATERIAIS]: "Preparando Materiais",
  [StatusProducao.MONTANDO_KIT]: "Montando Kit",
  [StatusProducao.PRONTO_PARA_ENVIO]: "Pronto para Envio",
  [StatusProducao.EM_ESPERA]: "Em Espera",
  [StatusProducao.CANCELADO]: "Cancelado",
};

export const StatusProducaoColors: Record<StatusProducao, string> = {
  [StatusProducao.AGENDADO]: "#0088FE",
  [StatusProducao.MATERIAIS_PENDENTES]: "#FFBB28",
  [StatusProducao.PREPARANDO_MATERIAIS]: "#00C49F",
  [StatusProducao.MONTANDO_KIT]: "#FF8042",
  [StatusProducao.PRONTO_PARA_ENVIO]: "#A2E8A5",
  [StatusProducao.EM_ESPERA]: "#FF4136",
  [StatusProducao.CANCELADO]: "#FF0000",
};

export const StatusEntrega = {
  PENDENTE_TRANSPORTADORA: "PENDENTE_TRANSPORTADORA",
  COLETA_AGENDADA: "COLETA_AGENDADA",
  EM_TRANSITO: "EM_TRANSITO",
  ENTREGUE: "ENTREGUE",
  ATRASADA: "ATRASADA",
  CANCELADA: "CANCELADA",
} as const;
export type StatusEntrega = (typeof StatusEntrega)[keyof typeof StatusEntrega];

export const StatusPagamentoVenda = {
  PENDENTE: "PENDENTE",
  PAGO_PARCIALMENTE: "PAGO_PARCIALMENTE",
  PAGO: "PAGO",
  VENCIDO: "VENCIDO",
  CANCELADO: "CANCELADO",
} as const;
export type StatusPagamentoVenda =
  (typeof StatusPagamentoVenda)[keyof typeof StatusPagamentoVenda];

export const TipoLancamento = {
  R: "R",
  D: "D",
} as const;
export type TipoLancamento =
  (typeof TipoLancamento)[keyof typeof TipoLancamento];

export const StatusPedidoCompra = {
  SOLICITADO: "SOLICITADO",
  COMPRADO: "COMPRADO",
  ENTREGUE: "ENTREGUE",
  ENTREGUE_COM_ALTERACAO: "ENTREGUE_COM_ALTERACAO",
  RESOLVIDO: "RESOLVIDO",
} as const;
export type StatusPedidoCompra =
  (typeof StatusPedidoCompra)[keyof typeof StatusPedidoCompra];
