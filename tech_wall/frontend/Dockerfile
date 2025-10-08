# Stage 1: Build Flutter App
FROM ghcr.io/cirruslabs/flutter:3.35.4 AS builder

WORKDIR /app

# Copia os arquivos do projeto
COPY . .

# Copia o .env de produção para .env, que será lido pelo app
COPY .env.production .env

# Instala as dependências
RUN flutter pub get

# Constrói a aplicação web
RUN flutter build web --release --wasm

# Stage 2: Serve with Nginx
FROM nginx:1.29.1-alpine

# Adiciona o MIME type para arquivos .mjs de forma segura
RUN sed -i '$ d' /etc/nginx/mime.types && \
    echo '    application/javascript mjs;' >> /etc/nginx/mime.types && \
    echo '}' >> /etc/nginx/mime.types

# Copia a build do Flutter para o diretório do Nginx
COPY --from=builder /app/build/web /usr/share/nginx/html

# Copia a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
