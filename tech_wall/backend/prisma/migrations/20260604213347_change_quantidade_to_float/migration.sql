-- AlterTable
ALTER TABLE "materia_prima" ALTER COLUMN "quantidade" SET DEFAULT 0,
ALTER COLUMN "quantidade" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "estoque_minimo" SET DEFAULT 0,
ALTER COLUMN "estoque_minimo" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "materiais_modelo_casa" ALTER COLUMN "qt_modelo" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "materiais_placa" ALTER COLUMN "quantidade" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "movimentacao_materiais" ALTER COLUMN "qtde" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "venda_itens_override" ALTER COLUMN "qt_final" SET DATA TYPE DOUBLE PRECISION;
