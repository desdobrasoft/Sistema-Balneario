/*
  Warnings:

  - The primary key for the `materiais_modelo_casa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `material_id` on the `materiais_modelo_casa` table. All the data in the column will be lost.
  - The primary key for the `materiais_placa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `material_id` on the `materiais_placa` table. All the data in the column will be lost.
  - You are about to drop the column `material_id` on the `movimentacao_materiais` table. All the data in the column will be lost.
  - You are about to drop the column `material_id` on the `pedidos_compra` table. All the data in the column will be lost.
  - You are about to drop the column `material_id` on the `venda_itens_override` table. All the data in the column will be lost.
  - You are about to drop the `materiais_estoque` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[venda_id,materia_prima_id]` on the table `venda_itens_override` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `materia_prima_id` to the `materiais_modelo_casa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materia_prima_id` to the `materiais_placa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materia_prima_id` to the `movimentacao_materiais` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materia_prima_id` to the `pedidos_compra` table without a default value. This is not possible if the table is not empty.
  - Added the required column `materia_prima_id` to the `venda_itens_override` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "materiais_modelo_casa" DROP CONSTRAINT "materiais_modelo_casa_material_id_fkey";

-- DropForeignKey
ALTER TABLE "materiais_placa" DROP CONSTRAINT "materiais_placa_material_id_fkey";

-- DropForeignKey
ALTER TABLE "movimentacao_materiais" DROP CONSTRAINT "movimentacao_materiais_material_id_fkey";

-- DropForeignKey
ALTER TABLE "pedidos_compra" DROP CONSTRAINT "pedidos_compra_material_id_fkey";

-- DropForeignKey
ALTER TABLE "venda_itens_override" DROP CONSTRAINT "venda_itens_override_material_id_fkey";

-- DropIndex
DROP INDEX "venda_itens_override_venda_id_material_id_key";

-- AlterTable
ALTER TABLE "materiais_modelo_casa" DROP CONSTRAINT "materiais_modelo_casa_pkey",
DROP COLUMN "material_id",
ADD COLUMN     "materia_prima_id" INTEGER NOT NULL,
ADD CONSTRAINT "materiais_modelo_casa_pkey" PRIMARY KEY ("modelo_casa_id", "materia_prima_id");

-- AlterTable
ALTER TABLE "materiais_placa" DROP CONSTRAINT "materiais_placa_pkey",
DROP COLUMN "material_id",
ADD COLUMN     "materia_prima_id" INTEGER NOT NULL,
ADD CONSTRAINT "materiais_placa_pkey" PRIMARY KEY ("placa_id", "materia_prima_id");

-- AlterTable
ALTER TABLE "movimentacao_materiais" DROP COLUMN "material_id",
ADD COLUMN     "materia_prima_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "pedidos_compra" DROP COLUMN "material_id",
ADD COLUMN     "materia_prima_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "venda_itens_override" DROP COLUMN "material_id",
ADD COLUMN     "materia_prima_id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "materiais_estoque";

-- CreateTable
CREATE TABLE "materia_prima" (
    "id" SERIAL NOT NULL,
    "item" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "unidade" TEXT,
    "estoque_minimo" INTEGER DEFAULT 0,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "materia_prima_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_materia_prima_deleted_at" ON "materia_prima"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "venda_itens_override_venda_id_materia_prima_id_key" ON "venda_itens_override"("venda_id", "materia_prima_id");

-- AddForeignKey
ALTER TABLE "materiais_modelo_casa" ADD CONSTRAINT "materiais_modelo_casa_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacao_materiais" ADD CONSTRAINT "movimentacao_materiais_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_itens_override" ADD CONSTRAINT "venda_itens_override_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materiais_placa" ADD CONSTRAINT "materiais_placa_materia_prima_id_fkey" FOREIGN KEY ("materia_prima_id") REFERENCES "materia_prima"("id") ON DELETE CASCADE ON UPDATE CASCADE;
