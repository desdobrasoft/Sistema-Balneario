# Estágio 1: Instalação de dependências e build
FROM node:24-alpine3.21 AS builder

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia os arquivos de manifesto do projeto
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies para o build)
RUN npm install

# Copia todo o código-fonte do backend
COPY . .

# Gera o cliente Prisma
RUN npx prisma generate

# Constrói a aplicação para produção
RUN npm run build

# Estágio 2: Imagem de produção
FROM node:24-alpine3.21

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Copia o package.json e o package-lock.json
COPY package*.json ./

# Instala SOMENTE as dependências de produção
RUN npm install --omit=dev

# Copia os artefatos de build do estágio anterior
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Expõe a porta que a aplicação NestJS irá rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/main"]
