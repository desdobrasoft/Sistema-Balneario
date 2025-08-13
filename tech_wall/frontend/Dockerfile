# Estágio 1: Build do Flutter Web
FROM ghcr.io/cirruslabs/flutter:latest AS builder

# Cria um grupo e um usuário não-root com a sintaxe correta, especificando um diretório home.
RUN addgroup --system --gid 1001 flutter && \
    adduser --system --uid 1001 --ingroup flutter --home /home/flutter flutter

# Declara os argumentos que serão recebidos do docker-compose
ARG BACKEND_HOST
ARG BACKEND_PORT
ARG AUTH
ARG LOGIN
ARG REFRESH
ARG LOGOUT
ARG CLIENTES
ARG ENTREGAS
ARG FINANCEIRO
ARG LANCAMENTOS
ARG PEDIDOS_COMPRA
ARG COMPRA_RECEBER
ARG COMPRA_RESOLVER
ARG MATERIAIS
ARG MODELO_CASA
ARG MOVIMENTACOES_MATERIAIS
ARG PRODUCAO
ARG USERS
ARG VENDAS
ARG CURRENT_USER

# Define o diretório de trabalho
WORKDIR /app

# Copia todos os arquivos do projeto de uma vez
COPY . .

# Muda a propriedade da pasta do app E da pasta do SDK do Flutter para o novo usuário.
# Isso resolve os erros de "Permission denied".
RUN chown -R flutter:flutter /app /sdks/flutter

# Muda para o usuário não-root antes de executar comandos do Flutter
USER flutter

# Adiciona o diretório do SDK do Flutter como seguro para o Git, corrigindo o erro de "dubious ownership"
RUN git config --global --add safe.directory /sdks/flutter

# Executa o pub get como o usuário 'flutter'
RUN flutter pub get

# Usa os argumentos para injetar as variáveis no build do Flutter
# A quebra de linha com '\' melhora a legibilidade
RUN flutter build web --release \
    --dart-define=BACKEND_HOST=${BACKEND_HOST} \
    --dart-define=BACKEND_PORT=${BACKEND_PORT} \
    --dart-define=AUTH=${AUTH} \
    --dart-define=LOGIN=${LOGIN} \
    --dart-define=REFRESH=${REFRESH} \
    --dart-define=LOGOUT=${LOGOUT} \
    --dart-define=CLIENTES=${CLIENTES} \
    --dart-define=ENTREGAS=${ENTREGAS} \
    --dart-define=FINANCEIRO=${FINANCEIRO} \
    --dart-define=LANCAMENTOS=${LANCAMENTOS} \
    --dart-define=PEDIDOS_COMPRA=${PEDIDOS_COMPRA} \
    --dart-define=COMPRA_RECEBER=${COMPRA_RECEBER} \
    --dart-define=COMPRA_RESOLVER=${COMPRA_RESOLVER} \
    --dart-define=MATERIAIS=${MATERIAIS} \
    --dart-define=MODELO_CASA=${MODELO_CASA} \
    --dart-define=MOVIMENTACOES_MATERIAIS=${MOVIMENTACOES_MATERIAIS} \
    --dart-define=PRODUCAO=${PRODUCAO} \
    --dart-define=USERS=${USERS} \
    --dart-define=VENDAS=${VENDAS} \
    --dart-define=CURRENT_USER=${CURRENT_USER}

# Estágio 2: Servidor Nginx
FROM nginx:1.29.0-alpine

# Copia a configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos web construídos do estágio anterior para o diretório do Nginx
COPY --from=builder /app/build/web /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
