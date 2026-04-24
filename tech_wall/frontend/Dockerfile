# Stage 1: Build React/Vite App
FROM node:24-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (melhor cache de layers)
COPY package*.json ./

RUN npm ci

# Copia o resto do projeto
COPY . .

# Define a URL da API para o build de produção
# O Traefik roteia /api para o backend, então usamos path relativo
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build de produção (Vite gera em dist/)
RUN npm run build

# Stage 2: Serve com Nginx
FROM nginx:1.27-alpine

# Remove a configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a build do Vite para o diretório do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
