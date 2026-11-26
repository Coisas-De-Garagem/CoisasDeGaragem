[AUDITORIA_OWASP_ISSUE-60.md](https://github.com/user-attachments/files/31493692/AUDITORIA_OWASP_ISSUE-60.md)
# Auditoria de Vulnerabilidades de Aplicação — OWASP Top 10

**Referente à issue:** [#60 — [Segurança/App] Mapeamento de Vulnerabilidades de Aplicação](https://github.com/Coisas-De-Garagem/CoisasDeGaragem/issues/60)
**Alvo:** Backend NestJS + Frontend React · **Método:** Análise estática (SAST), revisão de controle de acesso e configuração · **Referência:** OWASP Top 10 (2021)
**Legenda de status:** ✅ Conforme · ⚠️ Parcial / requer atenção · ❌ Não conforme · ➖ Não aplicável

---

## Sumário executivo

A auditoria da camada de aplicação encontrou **boas práticas de base** (Prisma ORM protegendo contra SQL Injection, senhas com bcrypt, rate limiting global, 0 dependências vulneráveis), mas identificou **falhas graves de controle de acesso e validação de entrada** que devem ser corrigidas.

**Os 3 achados mais críticos:**

1. **❌ Registro como ADMIN (escalação de privilégio direta)** — o `RegisterDto` aceita o campo `role`, então qualquer pessoa cria uma conta de administrador enviando `{"role":"ADMIN"}` em `POST /auth/register`.
2. **❌ Mass Assignment em `PUT /auth/me`** — o corpo não é um DTO validado; um usuário comum se promove a ADMIN.
3. **❌ Vazamento de hash de senha** — `GET /products/:id` retorna o objeto completo do vendedor, **incluindo o hash da senha**.

| Categoria da checklist | Resultado |
|---|---|
| 1. Autenticação e Sessão (A01/A07) | ❌ Falhas críticas de RBAC / mass assignment |
| 2. Validação de Entradas (A03/A06) | ⚠️ SQL Injection OK; DTOs incompletos; XSS no gerador de PDF |
| 3. Upload de Arquivos (A04) | ➖ Não implementado (imagens são URLs, não upload) |
| 4. Abuso e Exposição de Dados (A02/A05) | ❌ Vazamento de senha + ausência de cabeçalhos de segurança |

---

## 1. Autenticação e Gestão de Sessão (OWASP A01 / A07)

### 1.1 Validação de Token JWT — ⚠️ Parcial
- **Assinatura e expiração:** ✅ A estratégia valida assinatura e expiração corretamente (`ignoreExpiration: false`). — `backend/src/auth/jwt.strategy.ts`
- **❌ Segredo com *fallback* inseguro:** `secretOrKey: config.get('JWT_SECRET') || 'secret'`. Se `JWT_SECRET` não estiver definida, a API aceita **tokens forjados** assinados com a string `'secret'`. — `jwt.strategy.ts`
- **Endpoints citados na tarefa:** `/auth/me` ✅ protegido (`AuthGuard('jwt')`); `/products` e `/purchases` ✅ protegidos nas rotas de escrita; **`/users` não existe como rota HTTP** (o módulo `Users` só tem serviço interno — não há `users.controller.ts`).
- **Correção:** remover o `|| 'secret'`; abortar a inicialização se `JWT_SECRET` estiver ausente; usar segredo aleatório ≥ 32 bytes.

### 1.2 Validação do Google OAuth (`/auth/google`) — ⚠️ Parcial
- ✅ O `idToken` **é** validado junto ao Google (endpoint `tokeninfo`). — `backend/src/auth/auth.service.ts` → `googleLogin()`
- **❌ Verificação de audiência (`aud`) opcional:** só valida `aud` **se** `GOOGLE_CLIENT_ID` estiver configurada. Sem essa variável, um token emitido para **outro** app Google é aceito (*token audience confusion*).
- **⚠️ Bypass de desenvolvimento:** o token `mock-google-token` autentica automaticamente, protegido apenas por `NODE_ENV !== 'production'` (frágil a erro de configuração).
- **Correção:** tornar `GOOGLE_CLIENT_ID` obrigatória e validar `aud` sempre; usar a biblioteca oficial `google-auth-library` (validação local da assinatura) em vez do `tokeninfo`; remover o token mock do código de produção.

### 1.3 Controle de Acesso Baseado em Funções (RBAC) — ❌ Não conforme
> Observação: o sistema **não** possui papéis "comprador"/"vendedor" — os papéis são `USER` e `ADMIN`, e a relação de vendedor é por **propriedade** (quem criou o recurso). A auditoria testou a proteção sob essa ótica.

- **❌ CRÍTICO — Registro como ADMIN:** `RegisterDto` declara `@IsEnum(UserRole) role` como campo **obrigatório e livre**. Como `register()` repassa o DTO direto ao Prisma, `POST /auth/register` com `{"role":"ADMIN", ...}` **cria um administrador**. — `backend/src/auth/dto/register.dto.ts`, `auth.service.ts`
- **❌ ALTO — Escalação via perfil:** `PUT /auth/me` aceita corpo não validado e permite `{"role":"ADMIN"}` (ver 2.1).
- **❌ ALTO — IDOR em produtos:** qualquer usuário autenticado **edita** (`PATCH /products/:id`) e **exclui** (`DELETE /products/:id`) produtos de **outros** vendedores — a verificação de dono está **vazia** (`update`) ou o parâmetro de dono é **ignorado** (`remove`). — `backend/src/products/products.service.ts`
- **Correção:** remover `role` do `RegisterDto` (definir sempre `USER` no serviço); validar o corpo de `/auth/me` com DTO + allowlist; implementar `if (recurso.sellerId !== userId) throw new ForbiddenException()` em `update`/`remove`.

---

## 2. Validação de Entradas e Sanitização (OWASP A03 / A06)

### 2.1 Validação de DTOs — ⚠️ Parcial
- ✅ A maioria das rotas usa `class-validator` (ex.: `LoginDto`, `RegisterDto`, `CreateProductDto`) com `ValidationPipe` global.
- **❌ Falta `forbidNonWhitelisted: true`:** o pipe está configurado apenas com `transform: true` e `whitelist: true`. A tarefa pede explicitamente `forbidNonWhitelisted: true` para **rejeitar** (e não apenas descartar) propriedades não autorizadas. — `backend/src/main.ts`
- **❌ Rota sem DTO:** `PUT /auth/me` tipa o corpo como objeto literal (`{ name?; phone?; avatarUrl? }`), **não** como classe. O `ValidationPipe` ignora tipos não-classe, então o corpo cru chega ao `prisma.user.update()` → **Mass Assignment** (permite gravar `role`, etc.). — `backend/src/auth/auth.controller.ts`
- **Correção:** adicionar `forbidNonWhitelisted: true` ao `ValidationPipe`; criar `UpdateProfileDto` com decoradores; **nunca** repassar `@Body()` cru ao Prisma.

### 2.2 Prevenção de XSS no Frontend — ⚠️ Parcial
- ✅ O React **escapa** por padrão o conteúdo interpolado em JSX (título, descrição, perfil renderizados como texto são seguros).
- **❌ Stored XSS no gerador de etiqueta:** `frontend/src/utils/pdfGenerator.ts:48` usa `label.innerHTML = ...` interpolando `${product.name}` e `${product.category}` **sem sanitização**. Um vendedor pode injetar `<img src=x onerror=...>` no nome do produto; ao gerar a etiqueta, o script executa (roubo do token em `localStorage`).
- **⚠️ URLs de imagem não validadas como URL:** `imageUrl`/`images` usam `@IsString()` em vez de `@IsUrl()` — aceita esquemas arbitrários (ex.: `javascript:`). — `backend/src/products/dto/create-product.dto.ts`
- **Correção:** substituir `innerHTML` por `textContent`/APIs do DOM ou sanitizar com **DOMPurify**; validar URLs de imagem com `@IsUrl({ protocols: ['http','https'] })`.

### 2.3 Prevenção de SQL Injection — ✅ Conforme
- ✅ Todas as consultas usam os métodos **tipados do Prisma** (`findUnique`, `findMany`, `create`, `update`...). A varredura por queries brutas (`$queryRawUnsafe`, `$executeRawUnsafe`) **não encontrou nenhuma ocorrência**. Prisma parametriza as consultas, prevenindo SQL Injection.

---

## 3. Upload e Tratamento de Arquivos / Mídia (OWASP A04) — ➖ Não aplicável (como implementado)

> A aplicação **não possui endpoint de upload de arquivos**. O pacote `multer` consta em `backend/package.json` (`^1.4.5-lts.1`), mas **não é usado em nenhum lugar** do código (`FileInterceptor`, `diskStorage`, `@UploadedFile` ausentes). As imagens de produto são armazenadas como **URLs** (campos `imageUrl`/`images` do tipo `String`).

| Item da checklist | Status | Observação |
|---|---|---|
| Validação de tipo no Multer (`image/*`) | ➖ | Não há upload; controle não implementado |
| Limite de tamanho de payload (5MB) | ➖ | Não há upload de arquivo |
| Prevenção de Path Traversal | ➖ | Não há escrita de arquivo a partir de nome de usuário |

**Recomendações:**
1. Se o upload direto for adicionado no futuro, implementar os três controles (allowlist de MIME + verificação de *magic bytes*, `limits.fileSize`, e nomes de arquivo gerados no servidor com UUID — nunca usar o nome enviado pelo usuário).
2. Enquanto as imagens forem URLs, **validar a URL** (esquema `http/https`) e considerar risco de SSRF caso o backend passe a buscar essas URLs.
3. Remover a dependência `multer` não utilizada (reduz superfície de ataque).

---

## 4. Proteção contra Abuso e Exposição de Dados (OWASP A02 / A05)

### 4.1 Rate Limiting — ⚠️ Parcial
- ✅ Existe `@nestjs/throttler` **global** (120 requisições / 60s por IP), aplicado por padrão a `POST /auth/login`, `POST /auth/google` e `POST /purchases`. — `backend/src/app.module.ts`
- **⚠️ Limite permissivo para autenticação:** 120 tentativas/min por IP é alto para *brute-force* / *credential stuffing* em `/auth/login`. Não há limite mais estrito específico por rota.
- **⚠️** `GET /purchases/:id` usa `@SkipThrottle()` (isento do limite).
- **Correção:** aplicar `@Throttle()` mais restrito (ex.: 5–10/min) nas rotas de autenticação; reavaliar o `@SkipThrottle`.

### 4.2 Exposição de Dados Sensíveis — ❌ Não conforme
- **❌ Hash de senha vazado:** `GET /products/:id` retorna o produto com `include: { seller: true }`, o que inclui o **objeto `User` completo do vendedor — com o campo `password` (hash bcrypt)**. O mesmo padrão aparece nas rotas de QR Code. — `backend/src/products/products.service.ts:67`, `backend/src/qr-codes/qr-codes.controller.ts`
- ✅ Em outros pontos a senha é removida corretamente (`stripPassword`), e o `findAll` de produtos usa `seller: { select: { name, email } }` (seguro).
- ✅ Chaves de API (AbacatePay, Loki) e segredos ficam em variáveis de ambiente e **não** são retornados em respostas JSON.
- **Correção:** trocar `seller: true` por `seller: { select: { id, name, email, avatarUrl } }` em **todas** as consultas expostas; nunca incluir o `User` cru em respostas.

### 4.3 Tratamento de Erros em Produção — ✅ Conforme (com ressalvas)
- ✅ O NestJS, por padrão, **não** expõe *stack traces* nem mensagens internas de exceções não tratadas ao usuário final (retorna `500 Internal Server Error` genérico). Não há filtro global que altere isso de forma insegura.
- **⚠️** `googleLogin` inclui a mensagem interna do erro na resposta: `throw new UnauthorizedException('Google authentication failed: ' + getErrorMessage(error))` — pequena divulgação de informação.
- **⚠️** Algumas falhas de autorização usam `throw new Error('Unauthorized')` (vira `500` em vez de `403`). — `products.service.ts`
- **Correção:** não repassar mensagens internas ao cliente; usar exceções HTTP apropriadas (`ForbiddenException`) em vez de `Error` genérico.

### 4.4 Cabeçalhos de Segurança HTTP — ❌ Não conforme
- **❌ `helmet` não é utilizado** e **nenhum** cabeçalho de segurança é configurado. Faltam **HSTS**, **X-Content-Type-Options**, **Content-Security-Policy**, **X-Frame-Options**, etc. — verificado em `backend/src/main.ts`
- **Correção:** instalar e habilitar `helmet` (`app.use(helmet())`) e definir uma CSP adequada ao frontend.

---

## 5. Achados adicionais fora da checklist (camada de aplicação)

Encontrados durante a auditoria e relevantes "antes do lançamento":

- **🔴 CRÍTICO — Bypass de pagamento:** `POST /payments/simulate` **não tem autenticação** e conclui qualquer compra pendente sem pagamento. — `backend/src/payments/payments.controller.ts`
- **🟡 Reserva sem autenticação:** `PATCH /products/:id/reserve` não exige login (permite reservar todo o estoque — DoS de inventário).
- **🟡 Prisma Studio / Postgres expostos** (portas 5555/5432) e **credenciais fracas** (`user`/`password`) no `docker-compose.yml`.
- **🔵 Swagger UI público** (`/api`) e **token JWT em `localStorage`** (amplia o impacto do XSS em 2.2).

---

## 6. Ferramentas e método

| Sugerido na tarefa | Uso nesta rodada |
|---|---|
| OWASP ZAP / Burp Suite | Pendente — varredura dinâmica planejada para a próxima rodada (requer app rodando) |
| Postman / Insomnia | Recomendado para reproduzir manualmente os PoCs de JWT/RBAC |
| Inspeção de cabeçalhos HTTP | ✅ Realizada por revisão de código (resultado: sem `helmet` — ver 4.4) |
| **Análise estática (SAST)** | ✅ **Executada** — revisão manual de todos os módulos do backend + frontend |
| **Scan de dependências (`npm audit`)** | ✅ **Executada** — 0 vulnerabilidades (backend e frontend) |
| **Scan de segredos (git)** | ✅ **Executada** — histórico e arquivos versionados |

---

## 7. Plano de correção priorizado

| # | Ação | Item | Severidade |
|---|---|---|---|
| 1 | Remover `role` do `RegisterDto` (forçar `USER` no serviço) | 1.3 | 🔴 Crítico |
| 2 | Proteger/remover `POST /payments/simulate` | 5 | 🔴 Crítico |
| 3 | `UpdateProfileDto` validado + `forbidNonWhitelisted: true` | 2.1 | 🟠 Alto |
| 4 | Checagem de dono em `products.service` (`update`/`remove`) | 1.3 | 🟠 Alto |
| 5 | Remover `password` dos `include: { seller: true }` | 4.2 | 🟠 Alto |
| 6 | Remover *fallback* `'secret'` do JWT | 1.1 | 🟠 Alto |
| 7 | Habilitar `helmet` + CSP | 4.4 | 🟡 Médio |
| 8 | Sanitizar `innerHTML` do gerador de PDF (DOMPurify) | 2.2 | 🟡 Médio |
| 9 | `aud` obrigatório no Google OAuth + remover token mock | 1.2 | 🟡 Médio |
| 10 | Rate limit estrito nas rotas de auth | 4.1 | 🟡 Médio |

