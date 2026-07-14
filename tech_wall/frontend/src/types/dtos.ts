import type {
  Cliente,
  MaterialModeloCasa,
  ModeloCasa,
  RequisitoModeloCasa,
  Venda,
  VendaItemOverride,
  VendaRequisito,
  VendaSuprimentoOverride,
} from "./schema";

export type CreateClienteDto = Pick<
  Cliente,
  "email" | "isInternal" | "nome" | "nroContato"
>;

export type CreateModeloCasaDto = Pick<
  ModeloCasa,
  "descricao" | "imagemBase64" | "nome" | "preco" | "tempoFabricacao"
> & {
  materiais?: MaterialRequeridoDto[];
  requisitos?: RequisitoDto[];
  suprimentosObra?: Record<string, unknown>[];
};

export type CreateVendaDto = Pick<
  Venda,
  "clienteId" | "dataVenda" | "enderecoEntrega" | "modeloId" | "preco"
> & {
  itensOverride?: VendaItemOverrideDto[];
  requisitosOverride?: VendaRequisitoOverrideDto[];
  suprimentosOverride?: VendaSuprimentoOverrideDto[];
};

export type MaterialRequeridoDto = Pick<
  MaterialModeloCasa,
  "materiaPrimaId" | "qtModelo"
>;

export type RequisitoDto = Pick<
  RequisitoModeloCasa,
  "alias" | "corteId" | "parede" | "tipo" | "tipoPlacaId"
>;

export type UpdateClienteDto = Partial<CreateClienteDto>;

export type UpdateModeloCasaDto = Partial<CreateModeloCasaDto>;

export type UpdateVendaDto = Partial<CreateVendaDto> & {
  status?: string;
  statusPagamento?: string;
};

export type VendaItemOverrideDto = Pick<
  VendaItemOverride,
  "materiaPrimaId" | "qtFinal"
>;

export type VendaRequisitoOverrideDto = Pick<
  VendaRequisito,
  "alias" | "corteId" | "parede" | "tipo" | "tipoPlacaId"
>;

export type VendaSuprimentoOverrideDto = Pick<
  VendaSuprimentoOverride,
  "momento" | "nome" | "quantidade" | "unidade"
>;
