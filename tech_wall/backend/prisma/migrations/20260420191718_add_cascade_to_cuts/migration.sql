-- DropForeignKey
ALTER TABLE "cortes" DROP CONSTRAINT "cortes_placa_resultante_id_fkey";

-- AddForeignKey
ALTER TABLE "cortes" ADD CONSTRAINT "cortes_placa_resultante_id_fkey" FOREIGN KEY ("placa_resultante_id") REFERENCES "placas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
