-- AlterEnum
ALTER TYPE "status_pedido_compra" ADD VALUE 'COMPRADO';

-- CreateTable
CREATE TABLE "notas_fiscais" (
    "id" SERIAL NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "tipo_arquivo" TEXT NOT NULL,
    "arquivo_base64" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_fiscais_lancamentos" (
    "id" SERIAL NOT NULL,
    "nota_fiscal_id" INTEGER NOT NULL,
    "lancamento_id" INTEGER NOT NULL,

    CONSTRAINT "notas_fiscais_lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notas_fiscais_lancamentos_nota_fiscal_id_lancamento_id_key" ON "notas_fiscais_lancamentos"("nota_fiscal_id", "lancamento_id");

-- AddForeignKey
ALTER TABLE "notas_fiscais_lancamentos" ADD CONSTRAINT "notas_fiscais_lancamentos_nota_fiscal_id_fkey" FOREIGN KEY ("nota_fiscal_id") REFERENCES "notas_fiscais"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fiscais_lancamentos" ADD CONSTRAINT "notas_fiscais_lancamentos_lancamento_id_fkey" FOREIGN KEY ("lancamento_id") REFERENCES "lancamentos_financeiros"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
