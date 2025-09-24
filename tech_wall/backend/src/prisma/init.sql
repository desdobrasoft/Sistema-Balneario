-- =================================================================
-- TIPOS ENUM
-- =================================================================
CREATE TYPE status_venda AS ENUM(
    'AGUARDANDO_AGENDAMENTO_PRODUCAO',
    'PRODUCAO_AGENDADA',
    'KIT_EM_PREPARACAO',
    'MATERIAIS_ALOCADOS',
    'PRONTO_PARA_ENVIO',
    'ENVIADO',
    'ENTREGUE',
    'AGUARDANDO_REPOSICAO_ESTOQUE',
    'CANCELADA'
);

CREATE TYPE status_pagamento_venda AS ENUM('PENDENTE', 'PAGO_PARCIALMENTE', 'PAGO', 'VENCIDO', 'CANCELADO');

-- R: Receita, D: Despesa
CREATE TYPE tipo_lancamento AS ENUM('R', 'D');

CREATE TYPE status_producao AS ENUM(
    'AGENDADO',
    'MATERIAIS_PENDENTES',
    'PREPARANDO_MATERIAIS',
    'MONTANDO_KIT',
    'PRONTO_PARA_ENVIO',
    'EM_ESPERA',
    'CANCELADO'
);

CREATE TYPE status_entrega AS ENUM(
    'PENDENTE_TRANSPORTADORA',
    'COLETA_AGENDADA',
    'EM_TRANSITO',
    'ENTREGUE',
    'ATRASADA',
    'CANCELADA'
);

CREATE TYPE status_pedido_compra AS ENUM('SOLICITADO', 'ENTREGUE', 'ENTREGUE_COM_ALTERACAO', 'RESOLVIDO');

-- =================================================================
-- TABELAS PRINCIPAIS E RELACIONAIS
-- =================================================================
-- Tabela de Usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    password_hash TEXT NOT NULL,
    refresh_token_hash TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    qt_vendas INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        username IS NOT NULL
        OR email IS NOT NULL
    )
);

-- Tabela de Funções (Roles)
CREATE TABLE roles (id SERIAL PRIMARY KEY, role VARCHAR(50) UNIQUE NOT NULL);

-- Tabela de Ligação: Usuários <-> Funções
CREATE TABLE user_roles (
    user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Tabela de Clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    nro_contato VARCHAR(20),
    historico_vendas INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Tipos de Materiais
CREATE TABLE tipos_materiais (id SERIAL PRIMARY KEY, nome VARCHAR(255) UNIQUE NOT NULL);

-- Tabela de Materiais no Estoque
CREATE TABLE materiais_estoque (
    id TEXT PRIMARY KEY,
    item TEXT NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    unidade VARCHAR(50),
    observacao TEXT,
    tipo_id INT REFERENCES tipos_materiais (id),
    lim_baixo_estoque INT DEFAULT 0,
    ultima_entrada TIMESTAMP WITH TIME ZONE,
    ultima_saida TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Especificações para Placas
CREATE TABLE placas_especificacoes (
    id SERIAL PRIMARY KEY,
    material_id TEXT UNIQUE NOT NULL REFERENCES materiais_estoque (id) ON DELETE CASCADE,
    altura DECIMAL(10, 2),
    largura DECIMAL(10, 2),
    espessura DECIMAL(10, 2),
    tipo_trama VARCHAR(255)
);

-- Tabela de Modelos de Casas
CREATE TABLE modelo_casa (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tempo_fabricacao INT NOT NULL,
    url_imagem TEXT,
    preco DECIMAL(12, 2) NOT NULL,
    qt_vendido INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Ligação: Materiais <-> Modelos de Casas
CREATE TABLE materiais_modelo_casa (
    modelo_casa_id INT NOT NULL REFERENCES modelo_casa (id) ON DELETE CASCADE,
    material_id TEXT NOT NULL REFERENCES materiais_estoque (id) ON DELETE CASCADE,
    qt_modelo INT NOT NULL,
    PRIMARY KEY (modelo_casa_id, material_id)
);

-- Tabela de Vendas
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    cliente_id INT REFERENCES clientes (id) ON DELETE SET NULL,
    modelo_id INT REFERENCES modelo_casa (id) ON DELETE RESTRICT,
    user_id INT REFERENCES users (id) ON DELETE SET NULL,
    data_venda TIMESTAMP WITH TIME ZONE NOT NULL,
    preco DECIMAL(12, 2) NOT NULL,
    endereco_entrega TEXT NOT NULL,
    status status_venda NOT NULL,
    status_pagamento status_pagamento_venda NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico do Status de Vendas
CREATE TABLE vendas_historico (
    id SERIAL PRIMARY KEY,
    venda_id INT NOT NULL REFERENCES vendas (id) ON DELETE CASCADE,
    status_anterior status_venda,
    status_novo status_venda NOT NULL,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Movimentação de Materiais
CREATE TABLE movimentacao_materiais (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users (id) ON DELETE SET NULL,
    material_id TEXT NOT NULL REFERENCES materiais_estoque (id) ON DELETE RESTRICT,
    tipo_movimentacao CHAR(1) NOT NULL CHECK (tipo_movimentacao IN ('I', 'O')),
    data_movimentacao TIMESTAMP WITH TIME ZONE NOT NULL,
    qtde INT NOT NULL CHECK (qtde > 0),
    fornecedor VARCHAR(255),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Lançamentos Financeiros
CREATE TABLE lancamentos_financeiros (
    id SERIAL PRIMARY KEY,
    tipo tipo_lancamento NOT NULL,
    status_pagamento status_pagamento_venda NOT NULL DEFAULT 'PENDENTE',
    descricao TEXT,
    valor_total DECIMAL(12, 2) NOT NULL,
    valor_pendente DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    data_vencimento DATE,
    data_ultimo_pagamento TIMESTAMP WITH TIME ZONE,
    venda_id INT REFERENCES vendas (id) ON DELETE SET NULL,
    movimentacao_material_id INT REFERENCES movimentacao_materiais (id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_referencia_exclusiva CHECK (num_nonnulls (venda_id, movimentacao_material_id) <= 1)
);

-- Tabela de Ordens de Produção
CREATE TABLE ordens_producao (
    id SERIAL PRIMARY KEY,
    venda_id INT NOT NULL UNIQUE REFERENCES vendas (id) ON DELETE CASCADE,
    data_agendamento DATE,
    status status_producao NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico do Status de Produção
CREATE TABLE ordens_producao_historico (
    id SERIAL PRIMARY KEY,
    ordem_producao_id INT NOT NULL REFERENCES ordens_producao (id) ON DELETE CASCADE,
    status_anterior status_producao,
    status_novo status_producao NOT NULL,
    notas TEXT,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Entregas
CREATE TABLE entregas (
    id SERIAL PRIMARY KEY,
    venda_id INT NOT NULL UNIQUE REFERENCES vendas (id) ON DELETE CASCADE,
    endereco_entrega TEXT NOT NULL,
    previsao_entrega DATE NOT NULL,
    transportadora VARCHAR(255),
    status status_entrega NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Histórico do Status de Entregas
CREATE TABLE entregas_historico (
    id SERIAL PRIMARY KEY,
    entrega_id INT NOT NULL REFERENCES entregas (id) ON DELETE CASCADE,
    status_anterior status_entrega,
    status_novo status_entrega NOT NULL,
    notas TEXT,
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para os pedidos de compra de materiais
CREATE TABLE pedidos_compra (
    id SERIAL PRIMARY KEY,
    -- Referências
    material_id TEXT NOT NULL REFERENCES materiais_estoque (id) ON DELETE RESTRICT,
    user_id INT REFERENCES users (id) ON DELETE SET NULL, -- Quem solicitou a compra
    -- Dados do Pedido
    qt_solicitada INT NOT NULL CHECK (qt_solicitada > 0),
    qt_entregue INT, -- Preenchido pelo estoquista no recebimento
    fornecedor VARCHAR(255),
    valor_unitario DECIMAL(12, 2), -- Opcional, mas útil para o financeiro
    data_pedido TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status status_pedido_compra NOT NULL DEFAULT 'SOLICITADO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para armazenar as quantidades de material que sobrescrevem o modelo padrão para uma venda
CREATE TABLE venda_itens_override (
    id SERIAL PRIMARY KEY,
    venda_id INT NOT NULL REFERENCES vendas (id) ON DELETE CASCADE,
    material_id TEXT NOT NULL REFERENCES materiais_estoque (id) ON DELETE RESTRICT,
    -- qt_final: A quantidade final deste material para a venda.
    -- Se uma venda tem qualquer registro aqui, os materiais do modelo base são ignorados
    -- e apenas os materiais desta tabela são considerados para a venda.
    qt_final INT NOT NULL,
    UNIQUE (venda_id, material_id)
);

-- =================================================================
-- TRIGGERS E ÍNDICES
-- =================================================================
-- Função de Trigger para atualizar o campo 'updated_at'
CREATE OR REPLACE FUNCTION trigger_set_timestamp () RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicando a trigger nas tabelas relevantes
CREATE TRIGGER set_timestamp_clientes BEFORE
UPDATE ON clientes FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp ();

CREATE TRIGGER set_timestamp_modelo_casa BEFORE
UPDATE ON modelo_casa FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp ();

CREATE TRIGGER set_timestamp_lancamentos BEFORE
UPDATE ON lancamentos_financeiros FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp ();

CREATE TRIGGER set_timestamp_ordens_producao BEFORE
UPDATE ON ordens_producao FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp ();

CREATE TRIGGER set_timestamp_entregas BEFORE
UPDATE ON entregas FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp ();

-- Função de Trigger para atualizar timestamps de entrada/saída de estoque
CREATE OR REPLACE FUNCTION atualizar_timestamps_estoque () RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantidade > OLD.quantidade THEN
        NEW.ultima_entrada := NOW();
    ELSIF NEW.quantidade < OLD.quantidade THEN
        NEW.ultima_saida := NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicando a trigger na tabela de materiais
CREATE TRIGGER trg_materiais_estoque_update BEFORE
UPDATE ON materiais_estoque FOR EACH ROW WHEN (OLD.quantidade IS DISTINCT FROM NEW.quantidade)
EXECUTE FUNCTION atualizar_timestamps_estoque ();

-- Índices para otimização de soft deletes
CREATE INDEX idx_modelo_casa_deleted_at ON modelo_casa (deleted_at);

CREATE INDEX idx_materiais_estoque_deleted_at ON materiais_estoque (deleted_at);

-- =================================================================
-- DADOS INICIAIS (SEEDS)
-- =================================================================
-- Inserção de Funções (Roles)
INSERT INTO
    roles (role)
VALUES
    ('admin'),
    ('financeiro'),
    ('estoque'),
    ('producao'),
    ('patio'),
    ('entrega');

-- Inserção do Usuário Administrador (senha: admin)
INSERT INTO
    users (username, password_hash, full_name)
VALUES
    (
        'admin',
        '$2a$12$6XqjTDrRx/2Wo.h/9Aq4C.uccPtsQCaW4qPLt1TgunzBGfiUuuvbW',
        'Administrador'
    );

-- Atribuição da função 'admin' ao usuário 'admin'
INSERT INTO
    user_roles (user_id, role_id)
VALUES
    (
        (
            SELECT
                id
            FROM
                users
            WHERE
                username = 'admin'
        ),
        (
            SELECT
                id
            FROM
                roles
            WHERE
                role = 'admin'
        )
    );

-- Inserção de Tipos de Materiais
INSERT INTO
    tipos_materiais (nome)
VALUES
    ('Fundação'),
    ('Estrutura'),
    ('Cobertura'),
    ('Instalações Hidráulicas'),
    ('Instalações Elétricas'),
    ('Esquadrias'),
    ('Acabamento'),
    ('Serviços'),
    ('Materiais Extras'),
    ('Placas');

-- Inserção de Materiais de Exemplo
INSERT INTO
    materiais_estoque (id, item, quantidade, unidade, tipo_id)
VALUES
    -- Fundação
    ('concreto', 'Concreto', 4, 'm³', 1),
    ('malha-ferro', 'Malha de ferro', 3, 'un', 1),
    ('painel-concreto', 'Painel de concreto leve + frete', 70, 'un', 1),
    ('prego-17x27', 'Pregos 17/27', 10, 'un', 1),
    ('tabuas-3m-20cm', 'Tábuas 3m x 20cm', 12, 'un', 1),
    ('ripao', 'Ripão (sarrafos)', 5, 'un', 1),
    ('viga-madeira-6x12-3m', 'Vigas de madeira 6x12 (3m)', 7, 'un', 1),
    -- Estrutura
    ('caibros-5x5', 'Caibros 5x5', 40, 'un', 2),
    -- Cobertura
    ('telhas', 'Telhas (eternit + cumeeira + parafusos)', 20, 'un', 3),
    -- Instalações Hidráulicas
    ('barra-cano-100', 'Barra de cano 100mm', 2, 'un', 4),
    ('barra-cano-25', 'Barra de cano 25mm', 2, 'un', 4),
    ('luvas-100-esgoto', 'Luvas 100mm / esgoto', 5, 'un', 4),
    ('luvas-25', 'Luvas 25mm', 10, 'un', 4),
    ('curva-100', 'Curva 100mm', 6, 'un', 4),
    ('joelhos-100', 'Joelhos 100mm / esgoto', 10, 'un', 4),
    ('joelho-90-sem-rosca-25', 'Joelho 90º sem rosca 25mm', 8, 'un', 4),
    ('tampao-100-25', 'Tampão (100mm / 25mm)', 5, 'un', 4),
    ('cola-cano', 'Cola para cano hidráulico', 1, 'un', 4),
    ('torneiras', 'Torneiras', 3, 'un', 4),
    -- Instalações Elétricas
    ('rolo-fio-2.5mm', 'Rolo de fio 2,5mm (preto/vermelho/branco)', 3, 'un', 5),
    ('tomadas', 'Tomadas', 7, 'un', 5),
    ('fita-isolante', 'Fita isolante', 5, 'un', 5),
    ('rolo-conduite-3-4', 'Rolo de conduite 3/4', 1, 'un', 5),
    ('bocal-luz', 'Bocal de luz', 6, 'un', 5),
    -- Esquadrias
    ('janela-blindex-160x100', 'Janela blindex 1,60m x 1,00m', 3, 'un', 6),
    ('porta-blindex-215x080', 'Porta blindex 2,15m x 0,80m', 3, 'un', 6),
    ('janela-correr-120x100', 'Janela de correr 1,20m x 1,00m', 3, 'un', 6),
    ('janela-basculante-060x040', 'Janela basculante 0,60m x 0,40m', 2, 'un', 6),
    ('janela-basculante-040x100', 'Janela basculante 0,40m x 1,00m', 1, 'un', 6),
    ('porta-abrir-215x070', 'Porta de abrir 2,15m x 0,70m', 1, 'un', 6),
    ('porta-aluminio-215x070', 'Porta de alumínio 2,15m x 0,70m', 1, 'un', 6),
    ('porta-madeira-215x070', 'Porta de madeira 2,15m x 0,70m', 3, 'un', 6),
    -- Acabamento
    ('argamassa-c3', 'Argamassa C3', 15, 'un', 7),
    (
        'lixas-massa-acrilica',
        'Lixas (massa acrílica – grão 80, 20m)',
        1,
        'un',
        7
    ),
    ('massa-textura-20kg', 'Massa textura 20kg', 5, 'un', 7),
    ('galao-selador', 'Galão de selador', 1, 'un', 7),
    ('tinta-18l', 'Tinta 18L', 2, 'galões', 7),
    -- Serviços
    ('mao-de-obra', 'Mão de obra', 0, NULL, 8);