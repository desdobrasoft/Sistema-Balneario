# Stage 1: Builder
FROM node:24-alpine AS builder

WORKDIR /usr/src/app

# Instala o openssl que é uma dependência do prisma
RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm install

COPY . .

# Gera o cliente Prisma para o ambiente Alpine
RUN npx prisma generate

RUN npm run build

# Stage 2: Production
FROM node:24-alpine

WORKDIR /usr/src/app

# Copia os node_modules da etapa de build
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copia a build da aplicação
COPY --from=builder /usr/src/app/dist ./dist

# Copia o schema do Prisma para a imagem de produção
COPY --from=builder /usr/src/app/prisma ./prisma

# Copia o script de entrypoint e o torna executável
COPY --from=builder /usr/src/app/docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

# Define o novo entrypoint que irá configurar a DATABASE_URL
ENTRYPOINT ["./docker-entrypoint.sh"]

# O comando a ser executado pelo entrypoint
CMD ["node", "dist/main"]
