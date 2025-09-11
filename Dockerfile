# ---- Estágio Base (Compartilhado) ----
# Usamos um estágio base para não repetir o FROM
FROM node:22.19.0-trixie-slim AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ---- Estágio de Desenvolvimento ----
# Este estágio terá tudo que o dev precisa
FROM base AS development
RUN npm install -g @nestjs/cli
RUN npm install
COPY . .
# Comando para rodar em modo de desenvolvimento com hot-reload
CMD ["npm", "run", "start:dev"]

# ---- Estágio de Build (usado pela produção) ----
# Este estágio é idêntico ao nosso 'builder' anterior
FROM base AS builder
RUN npm install
COPY . .
RUN npm run build

# ---- Estágio de Produção (Final) ----
# A imagem final e otimizada
FROM node:22.19.0-trixie-slim AS production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
# Comando para rodar em produção
CMD ["node", "dist/main.js"]
