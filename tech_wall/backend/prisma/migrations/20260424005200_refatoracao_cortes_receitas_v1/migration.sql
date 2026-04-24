-- CreateEnum
CREATE TYPE "tipo_requisito" AS ENUM ('PLACA_LISA', 'CORTE_ESPECIFICO');

-- CreateEnum
CREATE TYPE "status_placa" AS ENUM ('DISPONIVEL', 'ALOCADA', 'DESCARTADA');

-- DropForeignKey
ALTER TABLE "cortes" DROP CONSTRAINT "cortes_placa_pai_id_fkey";

-- DropForeignKey
ALTER TABLE "cortes" DROP CONSTRAINT "cortes_placa_resultante_id_fkey";

-- DropForeignKey
ALTER TABLE "placas_modelo_casa" DROP CONSTRAINT "placas_modelo_casa_modelo_casa_id_fkey";

-- DropForeignKey
ALTER TABLE "placas_modelo_casa" DROP CONSTRAINT "placas_modelo_casa_placa_id_fkey";

-- DropIndex
DROP INDEX "cortes_placa_resultante_id_key";

-- AlterTable
ALTER TABLE "cortes" DROP COLUMN "origem_x",
DROP COLUMN "origem_y",
DROP COLUMN "placa_pai_id",
DROP COLUMN "placa_resultante_id",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "nome" SET NOT NULL,
ALTER COLUMN "largura" SET NOT NULL,
ALTER COLUMN "altura" SET NOT NULL;

-- AlterTable
ALTER TABLE "placas" DROP COLUMN "retalho_descartado",
DROP COLUMN "retalhos_uteis",
ADD COLUMN     "corte_origem_x" DECIMAL(10,2),
ADD COLUMN     "corte_origem_y" DECIMAL(10,2),
ADD COLUMN     "corte_rotacao" INTEGER DEFAULT 0,
ADD COLUMN     "forma_corte_id" INTEGER,
ADD COLUMN     "status_placa" "status_placa" NOT NULL DEFAULT 'DISPONIVEL';

-- DropTable
DROP TABLE "placas_modelo_casa";

-- CreateTable
CREATE TABLE "requisitos_modelo_casa" (
    "id" SERIAL NOT NULL,
    "modelo_casa_id" INTEGER NOT NULL,
    "tipo" "tipo_requisito" NOT NULL,
    "alias" TEXT,
    "parede" TEXT NOT NULL DEFAULT 'Geral',
    "largura" DECIMAL(10,2),
    "altura" DECIMAL(10,2),
    "espessura" DECIMAL(10,2),
    "trama_esquerda_id" INTEGER,
    "trama_direita_id" INTEGER,
    "trama_superior_id" INTEGER,
    "trama_inferior_id" INTEGER,
    "corte_id" INTEGER,

    CONSTRAINT "requisitos_modelo_casa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venda_requisitos" (
    "id" SERIAL NOT NULL,
    "venda_id" INTEGER NOT NULL,
    "tipo" "tipo_requisito" NOT NULL,
    "alias" TEXT,
    "parede" TEXT NOT NULL DEFAULT 'Geral',
    "largura" DECIMAL(10,2),
    "altura" DECIMAL(10,2),
    "espessura" DECIMAL(10,2),
    "trama_esquerda_id" INTEGER,
    "trama_direita_id" INTEGER,
    "trama_superior_id" INTEGER,
    "trama_inferior_id" INTEGER,
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
CREATE UNIQUE INDEX "placas_nome_key" ON "placas"("nome");

-- AddForeignKey
ALTER TABLE "placas" ADD CONSTRAINT "placas_forma_corte_id_fkey" FOREIGN KEY ("forma_corte_id") REFERENCES "cortes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_modelo_casa" ADD CONSTRAINT "requisitos_modelo_casa_modelo_casa_id_fkey" FOREIGN KEY ("modelo_casa_id") REFERENCES "modelo_casa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_modelo_casa" ADD CONSTRAINT "requisitos_modelo_casa_corte_id_fkey" FOREIGN KEY ("corte_id") REFERENCES "cortes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_corte_id_fkey" FOREIGN KEY ("corte_id") REFERENCES "cortes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_placa_alocada_id_fkey" FOREIGN KEY ("placa_alocada_id") REFERENCES "placas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_suprimentos_override" ADD CONSTRAINT "venda_suprimentos_override_venda_id_fkey" FOREIGN KEY ("venda_id") REFERENCES "vendas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
