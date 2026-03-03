<div align="center">

# 🏠 Coisas De Garagem

**Plataforma de Garage Sales com QR codes**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

</div>

---

## 📖 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Instalação](#-instalação)
- [API Endpoints](#-api-endpoints)
- [Desenvolvimento](#-desenvolvimento)
- [Deploy](#-deploy)

---

## 🎯 Visão Geral

CoisasDeGaragem é uma plataforma full-stack para vendas de garagem que permite:

- **Vendedores**: Listar produtos com QR codes, gerenciar vendas e visualizar análises
- **Compradores**: Navegar por produtos, escanear QR codes e gerenciar compras
- **Autenticação**: Login/registro com JWT e controle de acesso por roles
- **QR Codes**: Geração automática e escaneamento de QR codes para produtos

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.2** + **TypeScript 5.9**
- **Vite 7.2** (Build tool)
- **Tailwind CSS 4.1** (Estilização)
- **React Router 7.12** (Roteamento)
- **Zustand 5.0** (State management)
- **React Hook Form 7.71** (Formulários)
- **Zod 4.3** (Validação)

### Backend
- **NestJS 11.0** + **TypeScript 5.7**
- **Prisma 7.2** (ORM)
- **PostgreSQL 15** (Database)
- **JWT** (Autenticação)
- **Passport** (Auth strategy)
- **Bcrypt** (Password hashing)

---

## 📁 Estrutura do Projeto

```
CoisasDeGaragem/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Schema do banco de dados
│   │   ├── migrations/        # Migrations
│   │   └── seed.ts          # Seed data
│   └── src/
│       ├── auth/             # Autenticação
│       ├── products/         # Gestão de produtos
│       ├── purchases/        # Gestão de compras
│       ├── analytics/        # Análises de vendas
│       ├── qr-codes/        # QR codes
│       └── users/           # Usuários
│
├── frontend/
│   └── src/
│       ├── components/       # Componentes reutilizáveis
│       ├── pages/           # Páginas da aplicação
│       │   ├── auth/       # Login, Register
│       │   ├── buyer/      # Dashboard, Compras, Histórico
│       │   ├── seller/     # Produtos, Vendas, Análises
│       │   ├── landing/    # Landing page
│       │   └── public/    # Sobre, Ajuda, Contato
│       ├── hooks/           # Custom hooks
│       ├── services/        # API services
│       ├── store/           # Zustand stores
│       └── types/          # TypeScript types
│
└── docker-compose.yml       # PostgreSQL container
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 15 (ou Docker)

### Passo 1: Clone o repositório

```bash
git clone https://github.com/yourusername/CoisasDeGaragem.git
cd CoisasDeGaragem
```

### Passo 2: Inicie o PostgreSQL

```bash
docker-compose up -d
```

Credenciais padrão:
- Database: `garagedb`
- User: `user`
- Password: `password`

### Passo 3: Configure o Backend

```bash
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Execute as migrations
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run start:dev
```

Backend disponível em: `http://localhost:3000`

### Passo 4: Configure o Frontend

```bash
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Frontend disponível em: `http://localhost:5173`

### Variáveis de Ambiente

**Backend (.env)**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/garagedb?schema=public"
JWT_SECRET="sua-chave-secreta-jwt"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"

# AbacatePay Integration
ABACATEPAY_API_KEY="abc_dev_..."
ABACATEPAY_WEBHOOK_SECRET="whsec_..."
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME="CoisasDeGaragem"
```

> **Note:** For a detailed guide on setting up the PIX payment integration, including webhooks and local testing, please see the [AbacatePay PIX Setup Guide](docs/abacate-pay/SETUP.md).

---

## 📚 API Endpoints

### Autenticação

```http
POST /auth/login
POST /auth/register
GET  /auth/me
```

### Produtos

```http
GET    /products              # Listar todos
GET    /products/my-products   # Meus produtos (Seller)
GET    /products/:id          # Detalhes do produto
POST   /products              # Criar produto (Seller)
PATCH  /products/:id          # Atualizar produto (Seller)
DELETE /products/:id          # Deletar produto (Seller)
```

### Compras

```http
GET    /purchases            # Listar compras/vendas
GET    /purchases/history    # Histórico de compras (Buyer)
GET    /purchases/sales      # Vendas (Seller)
GET    /purchases/:id        # Detalhes da compra
POST   /purchases            # Criar compra (Buyer)
```

### QR Codes

```http
GET  /qr-codes/:productId   # Gerar QR code
POST /qr-codes/scan         # Escanear QR code
```

### Análises

```http
GET /analytics/seller       # Análises do vendedor
```

---

## 💻 Desenvolvimento

### Backend

```bash
# Desenvolvimento
npm run start:dev          # Watch mode
npm run start:debug        # Debug mode

# Produção
npm run build              # Build
npm run start:prod         # Start production

# Testes
npm run test               # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Coverage

# Database
npx prisma generate        # Generate client
npx prisma migrate dev     # Create migration
npx prisma studio         # Open GUI
```

### Frontend

```bash
# Desenvolvimento
npm run dev               # Start dev server
npm run build             # Build for production
npm run preview           # Preview build

# Qualidade
npm run lint             # ESLint
```

---

## 🌐 Deploy

### Backend (Render)

1. Push para GitHub
2. Criar Web Service no Render
3. Configurar:
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm run start:prod`
4. Adicionar variáveis de ambiente

### Frontend (Vercel)

```bash
npm i -g vercel
cd frontend
vercel
```

### Database (Neon)

1. Criar projeto no [Neon](https://neon.tech)
2. Copiar connection string
3. Atualizar `DATABASE_URL` no backend
4. Executar migrations: `npx prisma migrate deploy`

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

<div align="center">

[⬆ Voltar ao Topo](#-coisasdegaragem)

</div>

