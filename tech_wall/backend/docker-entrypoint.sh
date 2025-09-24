#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Lê a senha do banco de dados do arquivo de segredo
DB_PASSWORD=$(cat /run/secrets/db-password)

# Lê os segredos JWT dos arquivos de segredo
export JWT_SECRET=$(cat /run/secrets/jwt-secret)
export JWT_REFRESH_SECRET=$(cat /run/secrets/jwt-refresh-secret)

# Exporta a DATABASE_URL completa, agora com a senha lida do segredo
export DATABASE_URL="postgresql://tech_wall:${DB_PASSWORD}@db:5432/tech_wall?schema=public"

# Gera o cliente Prisma antes de iniciar a aplicação para garantir que está atualizado
# com a string de conexão correta.
npx prisma generate

# Executa o comando original do contêiner (iniciar a aplicação)
exec "$@"
