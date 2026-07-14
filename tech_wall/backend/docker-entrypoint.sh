#!/bin/sh
# Exit immediately if a command exits with a non-zero status.
set -e

# Lê a senha do banco de dados do arquivo de segredo
DB_PASSWORD=$(cat /run/secrets/db-password)

# Lê os segredos JWT dos arquivos de segredo
export JWT_SECRET=$(cat /run/secrets/jwt-secret)

# Exporta a DATABASE_URL completa, agora com a senha lida do segredo, limites e timeout
export DATABASE_URL="postgresql://tech_wall:${DB_PASSWORD}@db:5432/tech_wall?schema=public&pool_timeout=15&connection_limit=5"

# Aplica migrations e seed apenas se a variável RUN_MIGRATIONS estiver definida.
# Isso evita race conditions quando múltiplas réplicas iniciam ao mesmo tempo.
if [ "${RUN_MIGRATIONS}" = "true" ]; then
  echo "[entrypoint] Aplicando migrations..."
  npx prisma migrate deploy --schema=./prisma/schema.prisma

  # Lê credenciais do admin dos secrets (se disponíveis)
  if [ -f /run/secrets/admin-user ]; then
    export ADMIN_USER=$(cat /run/secrets/admin-user)
  fi
  if [ -f /run/secrets/admin-password ]; then
    export ADMIN_PASSWORD=$(cat /run/secrets/admin-password)
  fi

  echo "[entrypoint] Executando seed..."
  node dist/prisma/seed.js

  echo "[entrypoint] Inicialização do banco concluída."
fi

echo "[entrypoint] Iniciando aplicação..."

# Executa o comando original do contêiner (iniciar a aplicação)
exec "$@"
