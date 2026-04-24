/*
  Warnings:

  - You are about to drop the column `altura_original` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `largura_original` on the `placas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "placas" DROP COLUMN "altura_original",
DROP COLUMN "largura_original",
ADD COLUMN     "corte_altura" DECIMAL(10,2),
ADD COLUMN     "corte_largura" DECIMAL(10,2);
