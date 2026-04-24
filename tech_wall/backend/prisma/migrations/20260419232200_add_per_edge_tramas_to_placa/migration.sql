/*
  Warnings:

  - You are about to drop the column `observacao` on the `materiais_estoque` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_id` on the `materiais_estoque` table. All the data in the column will be lost.
  - You are about to drop the column `ultima_entrada` on the `materiais_estoque` table. All the data in the column will be lost.
  - You are about to drop the column `ultima_saida` on the `materiais_estoque` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the column `tipo_trama` on the `placas` table. All the data in the column will be lost.
  - You are about to drop the `tipos_materiais` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "materiais_estoque" DROP CONSTRAINT "materiais_estoque_tipo_id_fkey";

-- AlterTable
ALTER TABLE "materiais_estoque" DROP COLUMN "observacao",
DROP COLUMN "tipo_id",
DROP COLUMN "ultima_entrada",
DROP COLUMN "ultima_saida";

-- AlterTable
ALTER TABLE "placas" DROP COLUMN "created_at",
DROP COLUMN "tipo_trama",
ADD COLUMN     "derivada_de_placa_id" INTEGER,
ADD COLUMN     "percurso_corte" JSONB,
ADD COLUMN     "retalho_descartado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "retalhos_uteis" JSONB,
ADD COLUMN     "trama_direita" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trama_direita_id" INTEGER,
ADD COLUMN     "trama_direita_orientacao" TEXT,
ADD COLUMN     "trama_esquerda" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trama_esquerda_id" INTEGER,
ADD COLUMN     "trama_esquerda_orientacao" TEXT,
ADD COLUMN     "trama_inferior" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trama_inferior_id" INTEGER,
ADD COLUMN     "trama_inferior_orientacao" TEXT,
ADD COLUMN     "trama_superior" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trama_superior_id" INTEGER,
ADD COLUMN     "trama_superior_orientacao" TEXT;

-- DropTable
DROP TABLE "tipos_materiais";

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

-- CreateIndex
CREATE UNIQUE INDEX "tramas_nome_key" ON "tramas"("nome");

-- AddForeignKey
ALTER TABLE "placas" ADD CONSTRAINT "placas_trama_esquerda_id_fkey" FOREIGN KEY ("trama_esquerda_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placas" ADD CONSTRAINT "placas_trama_direita_id_fkey" FOREIGN KEY ("trama_direita_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placas" ADD CONSTRAINT "placas_trama_superior_id_fkey" FOREIGN KEY ("trama_superior_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placas" ADD CONSTRAINT "placas_trama_inferior_id_fkey" FOREIGN KEY ("trama_inferior_id") REFERENCES "tramas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "placas" ADD CONSTRAINT "placas_derivada_de_placa_id_fkey" FOREIGN KEY ("derivada_de_placa_id") REFERENCES "placas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
