/*
  Warnings:

  - You are about to drop the column `trama_direita_orientacao` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `trama_esquerda_orientacao` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `trama_inferior_orientacao` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `trama_superior_orientacao` on the `placas` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "reforco_placa" AS ENUM ('1P', '2P', 'S/P');

-- AlterTable
ALTER TABLE "placas" DROP COLUMN "trama_direita_orientacao",
DROP COLUMN "trama_esquerda_orientacao",
DROP COLUMN "trama_inferior_orientacao",
DROP COLUMN "trama_superior_orientacao",
ADD COLUMN     "reforco" "reforco_placa" DEFAULT 'S/P';

-- AddForeignKey
ALTER TABLE "requisitos_modelo_casa" ADD CONSTRAINT "requisitos_modelo_casa_trama_esquerda_id_fkey" FOREIGN KEY ("trama_esquerda_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_modelo_casa" ADD CONSTRAINT "requisitos_modelo_casa_trama_direita_id_fkey" FOREIGN KEY ("trama_direita_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_modelo_casa" ADD CONSTRAINT "requisitos_modelo_casa_trama_superior_id_fkey" FOREIGN KEY ("trama_superior_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisitos_modelo_casa" ADD CONSTRAINT "requisitos_modelo_casa_trama_inferior_id_fkey" FOREIGN KEY ("trama_inferior_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_trama_esquerda_id_fkey" FOREIGN KEY ("trama_esquerda_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_trama_direita_id_fkey" FOREIGN KEY ("trama_direita_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_trama_superior_id_fkey" FOREIGN KEY ("trama_superior_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venda_requisitos" ADD CONSTRAINT "venda_requisitos_trama_inferior_id_fkey" FOREIGN KEY ("trama_inferior_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
