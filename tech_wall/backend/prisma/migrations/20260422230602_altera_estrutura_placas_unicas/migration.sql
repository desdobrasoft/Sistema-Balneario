/*
  Warnings:

  - You are about to drop the column `qt_aguardando_producao` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `qt_em_producao` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `qt_pronta` on the `placas` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusProducaoPlaca" AS ENUM ('AGUARDANDO', 'EM_PRODUCAO', 'FINALIZADA');

-- AlterTable
ALTER TABLE "placas" DROP COLUMN "qt_aguardando_producao",
DROP COLUMN "qt_em_producao",
DROP COLUMN "qt_pronta",
ADD COLUMN     "materiais_consumidos" JSONB,
ADD COLUMN     "status" "StatusProducaoPlaca" NOT NULL DEFAULT 'AGUARDANDO';
