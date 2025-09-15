# =================================================================
# ESTÁGIO 1: "builder" - Ambiente para Desenvolvimento e Build
# =================================================================
# Este estágio contém TODAS as dependências (dev e prod) e o código-fonte.
# Ele será usado pelo Dev Container e como fonte para o estágio de produção.
FROM node:22.19.0-trixie-slim AS builder

# Atualiza e instala pacotes úteis que queremos no nosso ambiente de dev
RUN apt-get update && apt-get install -y git git-flow

WORKDIR /usr/src/app

COPY package*.json ./

# 'npm ci' ao inves do 'npm i', promove uma instalação rápida e consistente baseada no lockfile
RUN npm ci

COPY . .

# Compila o TypeScript para JavaScript, criando a pasta /dist
# Este passo é necessário para o estágio de produção.
RUN npm run build


# =================================================================
# ESTÁGIO 2: "production" - A imagem final, enxuta e otimizada
# =================================================================
FROM node:22.19.0-trixie-slim AS production

WORKDIR /usr/src/app

# Define o ambiente para produção, o que otimiza muitas bibliotecas
ENV NODE_ENV=production

COPY package*.json ./

# Instala APENAS as dependências de produção. É mais rápido e seguro.
RUN npm ci --omit=dev

# Copia o código já compilado do estágio 'builder'
COPY --from=builder /usr/src/app/dist ./dist

# Comando padrão para iniciar a aplicação em modo de produção
CMD ["node", "dist/main.js"]
