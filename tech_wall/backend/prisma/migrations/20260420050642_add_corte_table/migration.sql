-- CreateTable
CREATE TABLE "cortes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT,
    "percurso" JSONB NOT NULL,
    "origem_x" DECIMAL(10,2) NOT NULL,
    "origem_y" DECIMAL(10,2) NOT NULL,
    "largura" DECIMAL(10,2),
    "altura" DECIMAL(10,2),
    "placa_pai_id" INTEGER NOT NULL,
    "placa_resultante_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cortes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cortes_placa_resultante_id_key" ON "cortes"("placa_resultante_id");

-- AddForeignKey
ALTER TABLE "cortes" ADD CONSTRAINT "cortes_placa_pai_id_fkey" FOREIGN KEY ("placa_pai_id") REFERENCES "placas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cortes" ADD CONSTRAINT "cortes_placa_resultante_id_fkey" FOREIGN KEY ("placa_resultante_id") REFERENCES "placas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
