# Guia de Deployment - Coisas de Garagem

## Arquitetura de Deployment

- **Frontend**: Vercel (React + Vite)
- **Backend**: Render (NestJS)
- **Banco de Dados**: Neon (PostgreSQL)

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Conta no [Render](https://render.com)
3. Projeto configurado no [Neon](https://neon.tech)
4. Repositório no GitHub

## 1. Deploy do Backend no Render

### Configuração Manual (Dashboard)

1. Acesse [Render Dashboard](https://dashboard.render.com)
2. Clique em "New" > "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: coisas-de-garagem-api
   - **Branch**: main (ou sua branch principal)
   - **Root Directory**: backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

### Variáveis de Ambiente

No dashboard do Render, adicione:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=sua-chave-secreta-jwt
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=production
CORS_ORIGINS=https://coisas-de-garagem.vercel.app,https://*.vercel.app
```

### Deploy Automático

O Render fará deploy automático a cada push para a branch configurada.

## 2. Deploy do Frontend no Vercel

### Via Dashboard

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em "Add New" > "Project"
3. Importe o repositório GitHub
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: dist

### Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Na pasta frontend
cd frontend
vercel

# Seguir prompts
```

### Após o Deploy

1. Copie a URL do backend no Render (ex: https://coisas-de-garagem-api.onrender.com)
2. Atualize `frontend/.env`:
   ```env
   VITE_API_URL=https://coisas-de-garagem-api.onrender.com
   ```
3. Faça commit e push - Vercel fará redeploy automático

## 3. Configuração do Neon

### Criar Projeto

1. Acesse [Neon Console](https://console.neon.tech)
2. Clique em "Create a project"
3. Escolha nome do projeto e região
4. Copie a connection string

### Executar Migrations

```bash
# No diretório backend
cd backend

# Configure DATABASE_URL com a connection string do Neon
export DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Execute migrations
npx prisma migrate deploy

# Ou execute migrations específicas
npx prisma migrate resolve --applied "init"
```

## 4. Testando o Deploy

### Backend
```bash
curl https://coisas-de-garagem-api.onrender.com/health
```

### Frontend
Acesse: https://coisas-de-garagem.vercel.app

## Troubleshooting

### Backend não responde
- Verificar logs no Render Dashboard
- Apps free dormem após 15 min - primeira requisição demora ~30s
- Verificar se DATABASE_URL está correto

### CORS errors
- Verificar variável CORS_ORIGINS no Render
- Confirmar URL do frontend no Vercel

### Erro de conexão com banco
- Verificar se DATABASE_URL está correto
- Confirmar que o projeto Neon está ativo
- Verificar se migrations foram executadas

## Custos

### Plano Gratuito
- **Vercel**: 100GB bandwidth/mês
- **Render**: 750 horas/mês, app dorme após 15 min
- **Neon**: 0.5GB storage, 3 project limit

### Upgrade Recomendado (quando necessário)
- **Render Starter**: $7/mês (app não dorme)
- **Vercel Pro**: $20/mês (analytics, team)
- **Neon Pro**: $19/mês (3GB storage, mais conexões)

## CI/CD

Ambos os serviços têm deploy automático configurado:
- Push para branch principal → Deploy automático
- PRs criam preview deployments no Vercel

## Monitoramento

### Logs
- **Render**: Dashboard > Logs
- **Vercel**: Dashboard > Functions > Logs

### Métricas
- **Render**: Dashboard > Metrics
- **Vercel**: Dashboard > Analytics (plano Pro)
- **Neon**: Console > Metrics

## Rollback

### Render
Dashboard > Deploys > Selecionar deploy anterior > "Rollback"

### Vercel
Dashboard > Deployments > Três pontos > "Promote to Production"

## Backup do Banco de Dados

O Neon oferece backups automáticos:
- **Free**: 7 dias de retenção
- **Pro**: 30 dias de retenção

Para fazer backup manual:
```bash
# Export do banco
npx prisma db pull --schema-only

# Ou use pg_dump
pg_dump $DATABASE_URL > backup.sql
```

## Segurança Adicional

### Variáveis de Ambiente
- Nunca commitar `.env` no repositório
- Usar valores fortes para JWT_SECRET
- Rotacionar JWT_SECRET periodicamente

### CORS
- Configurar origens específicas em produção
- Não usar `*` em CORS_ORIGINS

### SSL/TLS
- Neon usa SSL por padrão
- Render fornece HTTPS automaticamente
- Vercel fornece HTTPS automaticamente
