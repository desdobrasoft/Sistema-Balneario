# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# Instala o openssl que é uma dependência do prisma
RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm ci

COPY . .

# Gera o cliente Prisma para o ambiente Alpine
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Build da aplicação NestJS (SWC, compila apenas src/)
RUN npm run build

# Compila o seed separadamente para JS (não é coberto pelo nest build)
RUN npx ts-node --transpile-only -e "" 2>/dev/null; \
    npx tsc prisma/seed.ts \
      --ignoreConfig \
      --outDir dist \
      --esModuleInterop \
      --skipLibCheck \
      --module commonjs \
      --target ES2023 \
      --resolveJsonModule

# Stage 2: Production
FROM node:24-alpine

# Instala o openssl que é uma dependência do prisma (também necessário em runtime)
RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Instala dependências de produção e a CLI do prisma (necessária para rodar migrations)
COPY package*.json ./
RUN npm ci --omit=dev && npm install prisma

# Copia a build da aplicação (inclui seed compilado)
COPY --from=builder /usr/src/app/dist ./dist

# Copia o schema e migrations do Prisma para a imagem de produção
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts

# Copia o script de entrypoint e o torna executável
COPY --from=builder /usr/src/app/docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

# Roda como usuário não-root por segurança
USER node

EXPOSE 3000

# Define o novo entrypoint que irá configurar a DATABASE_URL
ENTRYPOINT ["./docker-entrypoint.sh"]

# O comando a ser executado pelo entrypoint
CMD ["node", "dist/main"]
