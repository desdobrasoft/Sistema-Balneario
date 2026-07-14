-- CreateEnum
CREATE TYPE "reforco_placa" AS ENUM ('1P', '2P', 'S/P');

-- CreateEnum
CREATE TYPE "status_entrega" AS ENUM ('PENDENTE_TRANSPORTADORA', 'COLETA_AGENDADA', 'EM_TRANSITO', 'ENTREGUE', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "status_pagamento_venda" AS ENUM ('PENDENTE', 'PAGO_PARCIALMENTE', 'PAGO', 'VENCIDO', 'CANCELADO', 'ESTORNO_PENDENTE');

-- CreateEnum
CREATE TYPE "status_pedido_compra" AS ENUM ('SOLICITADO', 'COMPRADO', 'ENTREGUE', 'ENTREGUE_COM_ALTERACAO', 'RESOLVIDO');

-- CreateEnum
CREATE TYPE "status_placa" AS ENUM ('DISPONIVEL', 'ALOCADA', 'DESCARTADA');

-- CreateEnum
CREATE TYPE "status_producao" AS ENUM ('AGENDADO', 'MATERIAIS_PENDENTES', 'PREPARANDO_MATERIAIS', 'MONTANDO_KIT', 'PRONTO_PARA_ENVIO', 'EM_ESPERA', 'CANCELADO');

-- CreateEnum
CREATE TYPE "StatusProducaoPlaca" AS ENUM ('AGUARDANDO', 'EM_PRODUCAO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "status_venda" AS ENUM ('AGUARDANDO_AGENDAMENTO_PRODUCAO', 'PRODUCAO_AGENDADA', 'KIT_EM_PREPARACAO', 'MATERIAIS_ALOCADOS', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE', 'AGUARDANDO_REPOSICAO_ESTOQUE', 'CANCELADA');

-- CreateEnum
CREATE TYPE "tipo_lancamento" AS ENUM ('R', 'D');

-- CreateEnum
CREATE TYPE "tipo_requisito" AS ENUM ('PLACA_LISA', 'CORTE_ESPECIFICO');

-- CreateTable
CREATE TABLE "clientes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "nro_contato" TEXT,
    "historico_vendas" INTEGER DEFAULT 0,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cortes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "percurso" JSONB NOT NULL,
    "largura" DECIMAL(10,2) NOT NULL,
    "altura" DECIMAL(10,2) NOT NULL,
    "pontos" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "cortes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "previsao_entrega" DATE,
    "transportadora" TEXT,
    "status" "status_entrega" NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "entregas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entregas_historico" (
    "id" SERIAL NOT NULL,
    "entrega_id" INTEGER NOT NULL,
    "status_anterior" "status_entrega",
    "status_novo" "status_entrega" NOT NULL,
    "notas" TEXT,
    "data_alteracao" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entregas_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos_financeiros" (
    "id" SERIAL NOT NULL,
    "tipo" "tipo_lancamento" NOT NULL,
    "status_pagamento" "status_pagamento_venda" NOT NULL DEFAULT 'PENDENTE',
    "descricao" TEXT,
    "valor_total" DECIMAL(12,2) NOT NULL,
    "valor_pendente" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "data_vencimento" DATE,
    "data_ultimo_pagamento" TIMESTAMP(3),
    "venda_id" INTEGER,
    "movimentacao_material_id" INTEGER,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "lancamentos_financeiros_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiais_modelo_casa" (
    "modelo_casa_id" INTEGER NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "qt_modelo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "materiais_modelo_casa_pkey" PRIMARY KEY ("modelo_casa_id","materia_prima_id")
);

-- CreateTable
CREATE TABLE "materiais_tipo_placa" (
    "tipo_placa_id" INTEGER NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "materiais_tipo_placa_pkey" PRIMARY KEY ("tipo_placa_id","materia_prima_id")
);

-- CreateTable
CREATE TABLE "materia_prima" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,
    "quantidade" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unidade" TEXT,
    "estoque_minimo" DOUBLE PRECISION DEFAULT 0,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "materia_prima_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelo_casa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tempo_fabricacao" INTEGER NOT NULL,
    "imagem_base64" TEXT,
    "preco" DECIMAL(12,2) NOT NULL,
    "qt_vendido" INTEGER DEFAULT 0,
    "suprimentos_obra" JSONB,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "modelo_casa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacao_materiais" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "materia_prima_id" INTEGER NOT NULL,
    "tipo_movimentacao" CHAR(1) NOT NULL,
    "data_movimentacao" TIMESTAMP(3) NOT NULL,
    "qtde" DOUBLE PRECISION NOT NULL,
    "fornecedor" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacao_materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_fiscais" (
    "id" SERIAL NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "tipo_arquivo" TEXT NOT NULL,
    "arquivo_base64" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_fiscais_lancamentos" (
    "id" SERIAL NOT NULL,
    "nota_fiscal_id" INTEGER NOT NULL,
    "lancamento_id" INTEGER NOT NULL,

    CONSTRAINT "notas_fiscais_lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordens_producao" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "data_agendamento" DATE,
    "status" "status_producao" NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "ordens_producao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ordens_producao_historico" (
    "id" SERIAL NOT NULL,
    "ordem_producao_id" INTEGER NOT NULL,
    "status_anterior" "status_producao",
    "status_novo" "status_producao" NOT NULL,
    "notas" TEXT,
    "data_alteracao" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ordens_producao_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_compra" (
    "id" SERIAL NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "qt_solicitada" INTEGER NOT NULL,
    "qt_entregue" INTEGER,
    "fornecedor" TEXT,
    "valor_unitario" DECIMAL(12,2),
    "data_pedido" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "status" "status_pedido_compra" NOT NULL DEFAULT 'SOLICITADO',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "pedidos_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "tipo_placa_id" INTEGER NOT NULL,
    "status" "StatusProducaoPlaca" NOT NULL DEFAULT 'AGUARDANDO',
    "status_placa" "status_placa" NOT NULL DEFAULT 'DISPONIVEL',
    "materiais_consumidos" JSONB,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "derivada_de_placa_id" INTEGER,
    "forma_corte_id" INTEGER,
    "corte_origem_x" DECIMAL(10,2),
    "corte_origem_y" DECIMAL(10,2),
    "corte_rotacao" INTEGER DEFAULT 0,

    CONSTRAINT "placas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisitos_modelo_casa" (
    "id" SERIAL NOT NULL,
    "modelo_casa_id" INTEGER NOT NULL,
    "tipo" "tipo_requisito" NOT NULL,
    "alias" TEXT,
    "parede" TEXT NOT NULL DEFAULT 'Geral',
    "tipo_placa_id" INTEGER NOT NULL,
    "corte_id" INTEGER,

    CONSTRAINT "requisitos_modelo_casa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_placa" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "altura" DECIMAL(10,2) NOT NULL,
    "largura" DECIMAL(10,2) NOT NULL,
    "espessura" DECIMAL(10,2) NOT NULL,
    "reforco" "reforco_placa" NOT NULL DEFAULT 'S/P',
    "trama_esquerda" BOOLEAN NOT NULL DEFAULT false,
    "trama_esquerda_id" INTEGER,
    "trama_direita" BOOLEAN NOT NULL DEFAULT false,
    "trama_direita_id" INTEGER,
    "trama_superior" BOOLEAN NOT NULL DEFAULT false,
    "trama_superior_id" INTEGER,
    "trama_inferior" BOOLEAN NOT NULL DEFAULT false,
    "trama_inferior_id" INTEGER,
    "estoque_minimo" DOUBLE PRECISION DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tipos_placa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tramas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "altura_base" DECIMAL(10,2) NOT NULL,
    "profundidade_saliencia" DECIMAL(10,2) NOT NULL,
    "inicia_com_saliencia" BOOLEAN NOT NULL DEFAULT true,
    "direcionamento" TEXT NOT NULL DEFAULT 'DIREITA',
    "cortes" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tramas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "qt_vendas" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "vendas" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER,
    "modelo_id" INTEGER,
    "user_id" INTEGER,
    "data_venda" TIMESTAMP(3) NOT NULL,
    "preco" DECIMAL(12,2) NOT NULL,
    "endereco_entrega" TEXT NOT NULL,
    "status" "status_venda" NOT NULL,
    "status_pagamento" "status_pagamento_venda" NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "suprimentos_obra" JSONB,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "vendas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendas_historico" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "status_anterior" "status_venda",
    "status_novo" "status_venda" NOT NULL,
    "data_alteracao" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendas_historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_itens_override" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "materia_prima_id" INTEGER NOT NULL,
    "qt_final" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "venda_itens_override_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_requisitos" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "tipo" "tipo_requisito" NOT NULL,
    "alias" TEXT,
    "parede" TEXT NOT NULL DEFAULT 'Geral',
    "tipo_placa_id" INTEGER NOT NULL,
    "corte_id" INTEGER,
    "placa_alocada_id" INTEGER,

    CONSTRAINT "venda_requisitos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_suprimentos_override" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "unidade" TEXT NOT NULL,
    "momento" TEXT,

    CONSTRAINT "venda_suprimentos_override_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cortes_nome_key" ON "cortes"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_venda_id_key" ON "entregas"("venda_id");

-- CreateIndex
CREATE INDEX "idx_materia_prima_deleted_at" ON "materia_prima"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_modelo_casa_deleted_at" ON "modelo_casa"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "notas_fiscais_lancamentos_nota_fiscal_id_lancamento_id_key" ON "notas_fiscais_lancamentos"("nota_fiscal_id", "lancamento_id");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_producao_venda_id_key" ON "ordens_producao"("venda_id");

-- CreateIndex
CREATE UNIQUE INDEX "placas_nome_key" ON "placas"("nome");

-- CreateIndex
CREATE INDEX "idx_placas_deleted_at" ON "placas"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_key" ON "roles"("role");

-- CreateIndex
CREATE INDEX "idx_tipos_placa_deleted_at" ON "tipos_placa"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "tramas_nome_key" ON "tramas"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "venda_itens_override_venda_id_materia_prima_id_key" ON "venda_itens_override"("venda_id", "materia_prima_id");

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_historico" ADD CONSTRAINT "entregas_historico_entrega_id_fkey" FOREIGN KEY ("entrega_id") REFERENCES "entregas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_movimentacao_material_id_fkey" FOREIGN KEY ("movimentacao_material_id") REFERENCES "movimentacao_materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_modelo_casa" ADD CONSTRAINT "materiais_modelo_casa_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_modelo_casa" ADD CONSTRAINT "materiais_modelo_casa_modelo_casa_id_fkey" FOREIGN KEY ("modelo_casa_id") REFERENCES "modelo_casa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_tipo_placa" ADD CONSTRAINT "materiais_tipo_placa_tipo_placa_id_fkey" FOREIGN KEY ("tipo_placa_id") REFERENCES "tipos_placa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_tipo_placa" ADD CONSTRAINT "materiais_tipo_placa_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_materiais" ADD CONSTRAINT "movimentacao_materiais_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_materiais" ADD CONSTRAINT "movimentacao_materiais_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fiscais_lancamentos" ADD CONSTRAINT "notas_fiscais_lancamentos_nota_fiscal_id_fkey" FOREIGN KEY ("nota_fiscal_id") REFERENCES "notas_fiscais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fiscais_lancamentos" ADD CONSTRAINT "notas_fiscais_lancamentos_lancamento_id_fkey" FOREIGN KEY ("lancamento_id") REFERENCES "lancamentos_financeiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_producao" ADD CONSTRAINT "ordens_producao_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_producao_historico" ADD CONSTRAINT "ordens_producao_historico_ordem_producao_id_fkey" FOREIGN KEY ("ordem_producao_id") REFERENCES "ordens_producao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placas" ADD CONSTRAINT "placas_tipo_placa_id_fkey" FOREIGN KEY ("tipo_placa_id") REFERENCES "tipos_placa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placas" ADD CONSTRAINT "placas_derivada_de_placa_id_fkey" FOREIGN KEY ("derivada_de_placa_id") REFERENCES "placas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placas" ADD CONSTRAINT "placas_forma_corte_id_fkey" FOREIGN KEY ("forma_corte_id") REFERENCES "cortes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_modelo_casa" ADD CONSTRAINT "requisitos_modelo_casa_modelo_casa_id_fkey" FOREIGN KEY ("modelo_casa_id") REFERENCES "modelo_casa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_modelo_casa" ADD CONSTRAINT "requisitos_modelo_casa_corte_id_fkey" FOREIGN KEY ("corte_id") REFERENCES "cortes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_modelo_casa" ADD CONSTRAINT "requisitos_modelo_casa_tipo_placa_id_fkey" FOREIGN KEY ("tipo_placa_id") REFERENCES "tipos_placa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_placa" ADD CONSTRAINT "tipos_placa_trama_esquerda_id_fkey" FOREIGN KEY ("trama_esquerda_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_placa" ADD CONSTRAINT "tipos_placa_trama_direita_id_fkey" FOREIGN KEY ("trama_direita_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_placa" ADD CONSTRAINT "tipos_placa_trama_superior_id_fkey" FOREIGN KEY ("trama_superior_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tipos_placa" ADD CONSTRAINT "tipos_placa_trama_inferior_id_fkey" FOREIGN KEY ("trama_inferior_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelo_casa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas_historico" ADD CONSTRAINT "vendas_historico_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens_override" ADD CONSTRAINT "venda_itens_override_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens_override" ADD CONSTRAINT "venda_itens_override_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_corte_id_fkey" FOREIGN KEY ("corte_id") REFERENCES "cortes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_placa_alocada_id_fkey" FOREIGN KEY ("placa_alocada_id") REFERENCES "placas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_tipo_placa_id_fkey" FOREIGN KEY ("tipo_placa_id") REFERENCES "tipos_placa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_suprimentos_override" ADD CONSTRAINT "venda_suprimentos_override_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
