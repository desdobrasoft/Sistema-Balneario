/*
  Warnings:

  - The primary key for the `placas_modelo_casa` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "modelo_casa" ADD COLUMN     "suprimentos_obra" JSONB;

-- AlterTable
ALTER TABLE "placas_modelo_casa" DROP CONSTRAINT "placas_modelo_casa_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "parede" TEXT NOT NULL DEFAULT 'Geral',
ADD CONSTRAINT "placas_modelo_casa_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "vendas" ADD COLUMN     "suprimentos_obra" JSONB;
