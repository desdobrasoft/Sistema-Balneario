/*
  Warnings:

  - You are about to drop the column `corte_altura` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `corte_largura` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `corte_origem_x` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `corte_origem_y` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `percurso_corte` on the `placas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "placas" DROP COLUMN "corte_altura",
DROP COLUMN "corte_largura",
DROP COLUMN "corte_origem_x",
DROP COLUMN "corte_origem_y",
DROP COLUMN "percurso_corte";
