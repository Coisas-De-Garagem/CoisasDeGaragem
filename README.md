# Coisas de Garagem

Plataforma web para apoiar vendas de garagem, conectando vendedores e compradores por meio de cadastro de produtos, autenticação, leitura de QR Code e registro de compras.

## Visão geral

O projeto foi estruturado como uma aplicação full stack com frontend e backend desacoplados. A interface foi desenvolvida em React com Vite, enquanto a API foi construída com NestJS. A persistência utiliza PostgreSQL com Prisma como camada de acesso aos dados.

Atualmente, o sistema contempla o fluxo principal de cadastro e gerenciamento de produtos, autenticação, consulta por QR Code, histórico de compras e métricas para o vendedor. A integração com **AbacatePay/PIX** está prevista, mas ainda se encontra em desenvolvimento.

## Arquitetura atual

A arquitetura do projeto considera dois cenários complementares.

No **ambiente de desenvolvimento**, a equipe pode executar o frontend e o backend localmente, utilizando PostgreSQL em contêiner Docker para facilitar testes, integração e padronização do ambiente entre os integrantes do grupo.

No **ambiente de produção**, a arquitetura prevista separa as camadas da aplicação, com frontend hospedado em serviço de publicação web, backend implantado em serviço Node.js em nuvem e banco PostgreSQL gerenciado no Neon.

Resumo da arquitetura:

- **Frontend:** React + Vite + TypeScript
- **Backend:** NestJS + TypeScript
- **Banco de dados:** PostgreSQL
- **ORM:** Prisma com `@prisma/adapter-pg`
- **Autenticação:** JWT
- **Banco em produção:** Neon
- **Deploy previsto:** Vercel (frontend) + Render (backend) + Neon (database)

## Stack utilizada

### Frontend

- React 19
- Vite 7
- TypeScript 5.9
- React Router DOM
- Zustand
- React Hook Form
- Zod
- Recharts
- GSAP
- html2canvas
- jsPDF
- @zxing/library

### Backend

- NestJS 11
- TypeScript 5.7
- Prisma 7
- PostgreSQL
- `pg`
- `@prisma/adapter-pg`
- JWT
- Passport
- bcrypt
- Swagger

## Estrutura do repositório

```text
CoisasDeGaragem/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── prisma/
│   │   ├── products/
│   │   ├── purchases/
│   │   ├── qr-codes/
│   │   └── users/
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── types/
│   │   └── utils/
│   └── package.json
├── specs/
├── docker-compose.yml
├── README.md
└── DEPLOYMENT.md
```

## Funcionalidades já implementadas

- cadastro e autenticação de usuários com JWT;
- cadastro, edição, remoção e consulta de produtos;
- geração lógica e leitura de QR Code para consulta de itens;
- painel do vendedor com produtos, vendas e métricas;
- área do comprador com histórico e fluxo de consulta por QR Code;
- documentação da API via Swagger;
- suporte a ambiente local com Docker para banco PostgreSQL.

## Funcionalidades em desenvolvimento

- integração com **AbacatePay/PIX**;
- refinamentos de fluxo de pagamento e confirmação de transações;
- consolidação final da documentação técnica e acadêmica.

## Pré-requisitos

Para executar o projeto localmente, recomenda-se ter instalado:

- Node.js 18 ou superior;
- npm 9 ou superior;
- Docker e Docker Compose, caso o banco local seja executado por contêiner.

## Como executar em desenvolvimento

### 1. Clone o repositório

```bash
git clone https://github.com/Coisas-De-Garagem/CoisasDeGaragem.git
cd CoisasDeGaragem
```

### 2. Suba o PostgreSQL local com Docker

Se a equipe quiser utilizar o banco local padronizado, execute:

```bash
docker-compose up -d postgres
```

As credenciais configuradas no `docker-compose.yml` são:

```env
POSTGRES_DB=garagedb
POSTGRES_USER=user
POSTGRES_PASSWORD=password
```

> Também é possível subir toda a stack definida no `docker-compose.yml`, mas, para desenvolvimento, é comum levantar apenas o banco e executar frontend e backend manualmente.

### 3. Configure e execute o backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` com base no exemplo abaixo:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/garagedb?schema=public"
JWT_SECRET="sua-chave-secreta"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

Depois execute:

```bash
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

O backend ficará disponível em:

```text
http://localhost:3000
```

A API utiliza o prefixo global:

```text
/api/v1
```

A documentação Swagger fica em:

```text
http://localhost:3000/api
```

### 4. Configure e execute o frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Crie um arquivo `.env` com o seguinte conteúdo:

```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
VITE_ENABLE_MOCK_DATA="false"
```

Depois execute:

```bash
npm run dev
```

O frontend ficará disponível em:

```text
http://localhost:5173
```

## Execução com Docker Compose

O repositório inclui um `docker-compose.yml` com três serviços:

- `postgres`;
- `backend`;
- `frontend`.

Para subir tudo de uma vez:

```bash
docker-compose up --build
```

Nesse cenário, o compose já injeta as variáveis básicas para comunicação entre os serviços.

## Endpoints principais da API

Todos os endpoints abaixo consideram o prefixo `/api/v1`.

### Autenticação

```http
POST /auth/login
POST /auth/register
GET  /auth/me
```

### Produtos

```http
GET    /products
GET    /products/my-products
GET    /products/:id
POST   /products
PATCH  /products/:id
DELETE /products/:id
PATCH  /products/:id/reserve
PATCH  /products/:id/unreserve
PATCH  /products/:id/sold
```

### Compras

```http
GET  /purchases
GET  /purchases/history
GET  /purchases/sales
GET  /purchases/:id
POST /purchases
```

### QR Codes

```http
GET  /qr-codes/:productId
POST /qr-codes/scan
```

### Analytics

```http
GET /analytics/seller
```

## Banco de dados

O modelo atual do banco está centrado em três entidades principais:

- **User**;
- **Product**;
- **Purchase**.

Além disso, o schema define enums para papel do usuário, condição do produto, status da compra e método de pagamento.

Em produção, a conexão principal prevista é com **Neon**, utilizando PostgreSQL gerenciado. Em desenvolvimento, o projeto pode operar com PostgreSQL local em Docker.

## Produção e deploy

O arranjo previsto para produção é o seguinte:

- **Frontend:** Vercel;
- **Backend:** Render;
- **Banco de dados:** Neon.

O passo a passo detalhado de implantação está documentado em `DEPLOYMENT.md`.

## Observações importantes

- o frontend utiliza `VITE_API_BASE_URL` como variável principal para a URL da API;
- o backend utiliza `FRONTEND_URL` para montar o link público associado aos QR Codes;
- a aplicação backend usa prefixo global `/api/v1`;
- a integração com AbacatePay/PIX ainda deve ser apresentada como funcionalidade em desenvolvimento;
- a arquitetura atual substitui a proposta antiga baseada em Supabase/FastAPI, adotando NestJS + Prisma + PostgreSQL.

## Comandos úteis

### Backend

```bash
npm run start:dev
npm run build
npm run start:prod
npm run test
npm run test:e2e
npm run test:cov
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Equipe

Projeto desenvolvido por:

- Rafael Irvine
- Raul Falluh
- Rodrigo Castro
- Rodrigo Lemos

## Licença

Este projeto foi desenvolvido para fins acadêmicos na disciplina de Projeto Integrador III.
