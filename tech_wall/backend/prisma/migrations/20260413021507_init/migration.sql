-- CreateEnum
CREATE TYPE "status_pagamento_venda" AS ENUM ('PENDENTE', 'PAGO_PARCIALMENTE', 'PAGO', 'VENCIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "status_venda" AS ENUM ('AGUARDANDO_AGENDAMENTO_PRODUCAO', 'PRODUCAO_AGENDADA', 'KIT_EM_PREPARACAO', 'MATERIAIS_ALOCADOS', 'PRONTO_PARA_ENVIO', 'ENVIADO', 'ENTREGUE', 'AGUARDANDO_REPOSICAO_ESTOQUE', 'CANCELADA');

-- CreateEnum
CREATE TYPE "tipo_lancamento" AS ENUM ('R', 'D');

-- CreateEnum
CREATE TYPE "status_producao" AS ENUM ('AGENDADO', 'MATERIAIS_PENDENTES', 'PREPARANDO_MATERIAIS', 'MONTANDO_KIT', 'PRONTO_PARA_ENVIO', 'EM_ESPERA', 'CANCELADO');

-- CreateEnum
CREATE TYPE "status_entrega" AS ENUM ('PENDENTE_TRANSPORTADORA', 'COLETA_AGENDADA', 'EM_TRANSITO', 'ENTREGUE', 'ATRASADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "status_pedido_compra" AS ENUM ('SOLICITADO', 'ENTREGUE', 'ENTREGUE_COM_ALTERACAO', 'RESOLVIDO');

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT,
    "username" TEXT,
    "email" TEXT,
    "password_hash" TEXT NOT NULL,
    "refresh_token_hash" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "qt_vendas" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "materiais_estoque" (
    "id" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "unidade" TEXT,
    "observacao" TEXT,
    "tipo_id" INTEGER,
    "lim_baixo_estoque" INTEGER DEFAULT 0,
    "ultima_entrada" TIMESTAMP(3),
    "ultima_saida" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "materiais_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiais_modelo_casa" (
    "modelo_casa_id" INTEGER NOT NULL,
    "material_id" TEXT NOT NULL,
    "qt_modelo" INTEGER NOT NULL,

    CONSTRAINT "materiais_modelo_casa_pkey" PRIMARY KEY ("modelo_casa_id","material_id")
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
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "modelo_casa_pkey" PRIMARY KEY ("id")
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
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

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
CREATE TABLE "movimentacao_materiais" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "material_id" TEXT NOT NULL,
    "tipo_movimentacao" CHAR(1) NOT NULL,
    "data_movimentacao" TIMESTAMP(3) NOT NULL,
    "qtde" INTEGER NOT NULL,
    "fornecedor" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacao_materiais_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "entregas" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "endereco_entrega" TEXT NOT NULL,
    "previsao_entrega" DATE NOT NULL,
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
CREATE TABLE "pedidos_compra" (
    "id" SERIAL NOT NULL,
    "material_id" TEXT NOT NULL,
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
CREATE TABLE "venda_itens_override" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "material_id" TEXT NOT NULL,
    "qt_final" INTEGER NOT NULL,

    CONSTRAINT "venda_itens_override_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tipos_materiais" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "tipos_materiais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiais_placa" (
    "placa_id" INTEGER NOT NULL,
    "material_id" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "materiais_placa_pkey" PRIMARY KEY ("placa_id","material_id")
);

-- CreateTable
CREATE TABLE "placas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "altura" DECIMAL(10,2),
    "largura" DECIMAL(10,2),
    "espessura" DECIMAL(10,2),
    "tipo_trama" TEXT,
    "qt_aguardando_producao" INTEGER DEFAULT 0,
    "qt_em_producao" INTEGER DEFAULT 0,
    "qt_pronta" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "placas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "placas_modelo_casa" (
    "modelo_casa_id" INTEGER NOT NULL,
    "placa_id" INTEGER NOT NULL,
    "qt_placa" INTEGER NOT NULL,

    CONSTRAINT "placas_modelo_casa_pkey" PRIMARY KEY ("modelo_casa_id","placa_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_key" ON "roles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "idx_materiais_estoque_deleted_at" ON "materiais_estoque"("deleted_at");

-- CreateIndex
CREATE INDEX "idx_modelo_casa_deleted_at" ON "modelo_casa"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "ordens_producao_venda_id_key" ON "ordens_producao"("venda_id");

-- CreateIndex
CREATE UNIQUE INDEX "entregas_venda_id_key" ON "entregas"("venda_id");

-- CreateIndex
CREATE UNIQUE INDEX "venda_itens_override_venda_id_material_id_key" ON "venda_itens_override"("venda_id", "material_id");

-- CreateIndex
CREATE UNIQUE INDEX "tipos_materiais_nome_key" ON "tipos_materiais"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "placas_nome_key" ON "placas"("nome");

-- CreateIndex
CREATE INDEX "idx_placas_deleted_at" ON "placas"("deleted_at");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_estoque" ADD CONSTRAINT "materiais_estoque_tipo_id_fkey" FOREIGN KEY ("tipo_id") REFERENCES "tipos_materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_modelo_casa" ADD CONSTRAINT "materiais_modelo_casa_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais_estoque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_modelo_casa" ADD CONSTRAINT "materiais_modelo_casa_modelo_casa_id_fkey" FOREIGN KEY ("modelo_casa_id") REFERENCES "modelo_casa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_modelo_id_fkey" FOREIGN KEY ("modelo_id") REFERENCES "modelo_casa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas" ADD CONSTRAINT "vendas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendas_historico" ADD CONSTRAINT "vendas_historico_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_materiais" ADD CONSTRAINT "movimentacao_materiais_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais_estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_materiais" ADD CONSTRAINT "movimentacao_materiais_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_movimentacao_material_id_fkey" FOREIGN KEY ("movimentacao_material_id") REFERENCES "movimentacao_materiais"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_producao" ADD CONSTRAINT "ordens_producao_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ordens_producao_historico" ADD CONSTRAINT "ordens_producao_historico_ordem_producao_id_fkey" FOREIGN KEY ("ordem_producao_id") REFERENCES "ordens_producao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas" ADD CONSTRAINT "entregas_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregas_historico" ADD CONSTRAINT "entregas_historico_entrega_id_fkey" FOREIGN KEY ("entrega_id") REFERENCES "entregas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais_estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens_override" ADD CONSTRAINT "venda_itens_override_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais_estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens_override" ADD CONSTRAINT "venda_itens_override_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_placa" ADD CONSTRAINT "materiais_placa_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiais_estoque"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_placa" ADD CONSTRAINT "materiais_placa_placa_id_fkey" FOREIGN KEY ("placa_id") REFERENCES "placas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placas_modelo_casa" ADD CONSTRAINT "placas_modelo_casa_modelo_casa_id_fkey" FOREIGN KEY ("modelo_casa_id") REFERENCES "modelo_casa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placas_modelo_casa" ADD CONSTRAINT "placas_modelo_casa_placa_id_fkey" FOREIGN KEY ("placa_id") REFERENCES "placas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
