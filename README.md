# Portal ONG Ser Amor — API

API REST do portal de gestão da ONG Ser Amor, responsável pelo controle de alunos, cursos, aulas, presenças e demais recursos administrativos da organização.

Construída com [NestJS](https://nestjs.com/) e [TypeORM](https://typeorm.io/), usando PostgreSQL como banco de dados.

---

## Sumário

- [Formas de executar o projeto](#formas-de-executar-o-projeto)
- [Módulos](#módulos)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Executando o projeto](#executando-o-projeto)
  - [1. Dev Container em Named Volume ★ (recomendado)](#1-com-docker--dev-container-em-named-volume--recomendado)
  - [2. Dev Container com código local](#2-com-docker--dev-container-com-código-local)
  - [3. Manual via terminal](#3-com-docker--manual-via-terminal)
  - [4. Sem Docker — Setup local](#4-sem-docker--setup-local)
- [Criando o primeiro usuário (seed)](#criando-o-primeiro-usuário-seed)
- [Migrations](#migrations)
- [Documentação da API (Swagger)](#documentação-da-api-swagger)
- [Testes](#testes)
- [Scripts disponíveis](#scripts-disponíveis)

---

## Formas de executar o projeto

Existem dois caminhos principais para rodar o projeto: **com Docker** ou **sem Docker**. A forma recomendada é com Docker, pois elimina a necessidade de configurar a máquina manualmente.

```
├── Com Docker
│   ├── Manual (docker compose no terminal)
│   └── Dev Container
│       ├── Código espelhado localmente (clone + Reopen in Container)
│       └── ★ Código no container via Named Volume (recomendado)
└── Sem Docker (setup manual completo na máquina)
```

---

## Módulos

| Módulo             | Responsabilidade                  |
| ------------------ | --------------------------------- |
| `auth`             | Autenticação via JWT              |
| `users`            | Gestão de usuários                |
| `students`         | Gestão de alunos                  |
| `courses`          | Gestão de cursos                  |
| `course-classes`   | Turmas vinculadas aos cursos      |
| `lessons`          | Aulas de cada turma               |
| `attendances`      | Registro de presenças             |
| `locations`        | Locais onde as atividades ocorrem |
| `areas`            | Áreas de atuação da ONG           |
| `asset-categories` | Categorias de patrimônio          |

---

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores conforme o seu ambiente:

```bash
cp .env.example .env
```

| Variável            | Descrição                                | Padrão                        |
| ------------------- | ---------------------------------------- | ----------------------------- |
| `API_PORT`          | Porta em que a API será exposta          | `3000`                        |
| `API_HOST`          | Host da API (usado nos logs)             | `localhost`                   |
| `NODE_ENV`          | Ambiente de execução                     | `development`                 |
| `JWT_SECRET_KEY`    | Chave secreta para assinatura dos tokens | —                             |
| `JWT_EXPIRES_IN`    | Tempo de expiração do token JWT          | `1d`                          |
| `DATABASE_HOST`     | Host do banco de dados                   | `db` (nome do serviço Docker) |
| `DATABASE_PORT`     | Porta do PostgreSQL                      | `5432`                        |
| `DATABASE_USER`     | Usuário do banco de dados                | `admin`                       |
| `DATABASE_PASSWORD` | Senha do banco de dados                  | `admin123`                    |
| `DATABASE_NAME`     | Nome do banco de dados                   | `portal_ong_ser_amor`         |

| `SEED_ADMIN_NAME`   | Nome do usuário admin criado pelo seed          | —                             |
| `SEED_ADMIN_EMAIL`  | E-mail do usuário admin criado pelo seed        | —                             |
| `SEED_ADMIN_PASSWORD` | Senha do usuário admin criado pelo seed       | —                             |

> **Atenção:** em produção, substitua todos os valores padrão por valores seguros, especialmente `JWT_SECRET_KEY` e as credenciais do banco. **Não defina as variáveis `SEED_ADMIN_*` em produção.**

---

## Executando o projeto

> **Usuários Windows — Docker via WSL2**
>
> Se ao criar ou iniciar containers você encontrar erros de recursos insuficientes, crie o arquivo `.wslconfig` na pasta do seu usuário (`C:\Users\nome_do_usuario`) com o seguinte conteúdo:
>
> ```ini
> [wsl2]
> memory=8GB
> processors=4
> swap=2GB
> ```
>
> Os valores acima são uma referência — ajuste `memory`, `processors` e `swap` de acordo com os recursos disponíveis na sua máquina. Isso aumenta os recursos disponíveis para o WSL2 (e consequentemente para o Docker Desktop). Após criar o arquivo, reinicie o WSL com `wsl --shutdown` no PowerShell e abra o Docker Desktop novamente.

### 1. Com Docker — Dev Container em Named Volume ★ (recomendado)

Esta é a forma mais prática. Todo o código fica **dentro do container** — nada é instalado ou clonado na sua máquina além das ferramentas essenciais.

**O que você precisa ter instalado na máquina:**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (em execução)
- [VS Code](https://code.visualstudio.com/)
- Extensão [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) para o VS Code
- Cliente de API REST: [Insomnia](https://insomnia.rest/) ou [Postman](https://www.postman.com/)
- Cliente de banco de dados: [DBeaver](https://dbeaver.io/) ou [pgAdmin](https://www.pgadmin.org/)

**Passo a passo:**

1. Certifique-se de que o **Docker Desktop está em execução**.
2. Abra uma **nova janela** do VS Code.
3. Abra a paleta de comandos (`Ctrl+Shift+P` ou `Cmd+Shift+P`) e pesquise por:
   ```
   Dev Containers: Clone Repository in Named Container Volume
   ```
4. Cole a URL do repositório e siga as instruções.
5. O VS Code vai criar o container, instalar todas as dependências e abrir o projeto pronto para uso.

> Todo o ambiente de desenvolvimento (Node.js, dependências, banco de dados) é provisionado automaticamente pelo Dev Container. Não é necessário instalar a stack na máquina.

---

### 2. Com Docker — Dev Container com código local

Nesta variante, o repositório é clonado localmente e o container espelha a pasta do projeto. Qualquer alteração feita no container é refletida no sistema de arquivos local e vice-versa.

**O que você precisa ter instalado na máquina:**

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (em execução)
- [VS Code](https://code.visualstudio.com/) com a extensão [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- [Git](https://git-scm.com/)

**Passo a passo:**

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd portal-ong-ser-amor-api
   ```
2. Abra a pasta no VS Code.
3. Certifique-se de que o **Docker Desktop está em execução**.
4. Quando solicitado, clique em **Reopen in Container** (ou use a paleta de comandos: `Dev Containers: Reopen in Container`).
5. O VS Code vai construir o container e reabrir o projeto dentro dele.

---

### 3. Com Docker — Manual (via terminal)

Para quem prefere controle direto sobre os containers sem usar o Dev Container.

**Pré-requisitos:** Docker Desktop instalado e em execução.

```bash
# Desenvolvimento
docker compose up

# Produção
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

A API ficará disponível em `http://localhost:3000`.

> Em produção, a porta da API não é exposta diretamente. O serviço deve ficar atrás de um proxy reverso (ex.: Nginx).

---

### 4. Sem Docker — Setup local

Para rodar sem Docker é necessário instalar e configurar tudo na máquina.

**O que você precisa ter instalado:**

- [Node.js](https://nodejs.org/) v22+
- [PostgreSQL](https://www.postgresql.org/) v17+

**Passo a passo:**

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` com as credenciais do seu banco local:
   ```bash
   cp .env.example .env
   ```
3. Inicie a aplicação:

   ```bash
   # Desenvolvimento com hot-reload
   npm run dev

   # Produção
   npm run build
   npm run start:prod
   ```

---

## Criando o primeiro usuário (seed)

Como todos os endpoints são protegidos por autenticação JWT, é necessário criar um usuário admin antes de usar a API pela primeira vez.

1. Certifique-se de que as variáveis de seed estão definidas no seu `.env`:

   ```bash
   SEED_ADMIN_NAME="Admin"
   SEED_ADMIN_EMAIL="admin@example.com"
   SEED_ADMIN_PASSWORD="SenhaForte123!"
   ```

2. Com a aplicação **em execução**, rode o script em outro terminal:

   ```bash
   npm run seed:dev
   ```

O script verifica se o usuário já existe antes de criá-lo — é seguro executar mais de uma vez. Ele também recusa execução em `NODE_ENV=production`.

> **Atenção:** este script é exclusivo para desenvolvimento local. Nunca o execute em produção.

---

## Migrations

As migrations são executadas **automaticamente** ao iniciar a aplicação.

Para executar manualmente via CLI:

```bash
# Executar migrations pendentes
npm run typeorm migration:run -- -d <caminho-do-data-source>

# Reverter a última migration
npm run typeorm migration:revert -- -d <caminho-do-data-source>
```

---

## Documentação da API (Swagger)

Com a aplicação rodando, acesse:

| Formato | URL                              |
| ------- | -------------------------------- |
| UI      | `http://localhost:3000/api`      |
| JSON    | `http://localhost:3000/api-json` |

Em ambiente de desenvolvimento, o arquivo `api-docs.json` também é gerado automaticamente na raiz do projeto a cada inicialização.

---

## Testes

```bash
# Testes unitários
npm run test

# Testes unitários em modo watch
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes e2e
npm run test:e2e
```

---

## Scripts disponíveis

| Script               | Descrição                                     |
| -------------------- | --------------------------------------------- |
| `npm run dev`        | Inicia em modo desenvolvimento com hot-reload |
| `npm run build`      | Compila o TypeScript para JavaScript          |
| `npm run start:prod` | Inicia a aplicação compilada em modo produção |
| `npm run lint`       | Executa o ESLint com correção automática      |
| `npm run format`     | Formata o código com Prettier                 |
| `npm run test`       | Executa os testes unitários                   |
| `npm run test:cov`   | Executa os testes com relatório de cobertura  |
| `npm run test:e2e`   | Executa os testes end-to-end                  |
| `npm run seed:dev`   | Cria o usuário admin inicial (apenas em dev)  |
