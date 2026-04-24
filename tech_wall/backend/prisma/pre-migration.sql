-- Pre-Migration: Resolver duplicatas de nomes antes de aplicar @unique
-- Execute este script manualmente ANTES de rodar a migration se houver duplicatas.

-- 1. Encontrar e resolver duplicatas de nomes em placas
-- Adiciona o ID ao nome das duplicatas para torná-las únicas
UPDATE placas p
SET nome = p.nome || '-' || p.id
WHERE p.id NOT IN (
  SELECT MIN(id) FROM placas GROUP BY nome
);

-- 2. Encontrar e resolver duplicatas de nomes em cortes
UPDATE cortes c
SET nome = COALESCE(c.nome, 'Corte-') || '-' || c.id
WHERE c.id NOT IN (
  SELECT MIN(id) FROM cortes WHERE nome IS NOT NULL GROUP BY nome
);

-- 3. Garantir que nenhum corte tenha nome NULL (será @unique NOT NULL)
UPDATE cortes SET nome = 'Corte-' || id WHERE nome IS NULL;

-- 4. Adicionar coluna status_placa com valor padrão se não existir
-- (A migration do Prisma cuidará disso, mas é bom ter como referência)
