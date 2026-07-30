# Plano de Refatoração Completa do Frontend — CoisasDeGaragem

> Marketplace de **garage sales**. Refatoração total de UI/UX, inspirada em grandes marketplaces
> (Mercado Livre, Shopee, OLX). **2 designs dedicados**: mobile (bottom nav) + desktop (sidebar).
> **Zero emojis — somente ícones** (Font Awesome). pt-BR. Sem quebrar funcionalidades.

---

## Decisões de design

| Item | Decisão |
|------|---------|
| Paleta | Nova paleta em **tons de azul cobalto/azure** + acento **âmbar** |
| Mobile | **Bottom navigation tab bar** (máx 5 itens, ícone + label) |
| Desktop | **Sidebar lateral fixa** (com seções, colapsável, dark mode) |
| Dark mode | Consolidado via **tokens semânticos** que trocam sozinhos |
| Ícones | Apenas Font Awesome (wrapper `Icon` centralizado). Nenhum emoji |
| Tipografia | Inter (corpo) + Outfit (títulos) — mantidos |
| Arquitetura de layout | **Rotas aninhadas** com `<Outlet/>` — corrige bug crítico |

## Garantias de não-quebra
- **Não alterar**: `services/api.ts`, `services/authService.ts`, stores Zustand, hooks, `types/index.ts`
  (salvo ajustes estritamente cosméticos).
- **Rotas existentes mantidas** (apenas **adicionar** `/seller/qr-codes` e `/seller/settings`).
- **Lógica de pagamento / QR / scanner intocada**.

---

## Auditoria — substituições de emojis / ícones emoji-like

| Onde | Atual | Substituir por |
|------|-------|----------------|
| `components/layout/Header.tsx:6,37` | `faHand` + `animate-wave` (mão acenando) | Remover gesto; usar `faCircleUser`/avatar |
| `pages/seller/dashboard/SellerDashboard.tsx:20,129` | `faHand` + `animate-wave` | Remover gesto; ícone `faStore`/avatar |
| `styles/global.css:96-134` | `@keyframes wave` + `@utility animate-wave` | Remover após substituições |

> Nenhum caractere emoji unicode encontrado em `src/` ou `index.html`.

---

## Checklist por fase (marcar `[x]` ao concluir)

### Fase 1 — Design tokens e base
- [ ] `styles/global.css`: nova paleta "Cobalt & Amber" (primary 50–950, accent âmbar, neutros quentes, semânticos)
- [ ] Tokens de espaçamento / raio / sombra / tipografia
- [ ] `@custom-variant dark` + tokens semânticos (`bg-background`, `bg-surface`, `text-main`, `border-default`)
- [ ] Remover `src/App.css`

### Fase 2 — Design System (`components/common/`)
**Refatorar:**
- [ ] `Button` (variantes + dark) — adicionar `danger`, `success`
- [ ] `Card` — dark mode
- [ ] `Input`, `Select` — dark mode
- [ ] `Modal` — dark + melhor UX mobile (sheet no mobile)
- [ ] `Alert`, `Badge` — dark
- [ ] `Spinner`, `Skeleton` — dark
- [ ] `Pagination` — dark + mobile-friendly
- [ ] `ToastContainer` — dark
- [ ] `DarkModeToggle` — repassar para novo toggle

**Criar:**
- [ ] `Icon.tsx` — wrapper centralizado de FontAwesome
- [ ] `Textarea`
- [ ] `IconButton`
- [ ] `Avatar`
- [ ] `Tabs`
- [ ] `EmptyState`
- [ ] `StatCard` / `KpiCard`
- [ ] `SearchInput`
- [ ] `Rating` (estrelas via ícone)
- [ ] `Drawer`
- [ ] `Breadcrumb`
- [ ] `Tooltip`

### Fase 3 — Layout System
- [ ] `components/layout/navigation.ts` — **config única** de navegação (buyer/seller)
- [ ] `components/layout/AppShell.tsx` — responsivo, decide BottomNav vs Sidebar
- [ ] `components/layout/BottomNav.tsx` — bottom tab bar mobile
- [ ] `components/layout/Sidebar.tsx` — desktop, colapsável, seções, dark
- [ ] `components/layout/TopBar.tsx` — top bar enxuta (busca/perfil/notif)
- [ ] Refatorar `Header`, `Footer`, `PageLayout`
- [ ] **Reescrever `App.tsx`** com rotas aninhadas (`/seller/*`, `/buyer/*` envolvendo `AppShell`)
- [ ] Substituir/ajustar `SellerLayout`, `BuyerLayout`, `SellerSidebar`, `BuyerSidebar`

### Fase 4 — Auth
- [ ] `LoginPage` — layout split desktop / full-screen mobile
- [ ] `RegisterPage` — idem
- [ ] `LoginForm` — novos componentes
- [ ] `RegisterForm` — novos componentes
- [ ] Google Sign-in com ícone "G" (sem emoji)

### Fase 5 — Landing
- [ ] `LandingPage`
- [ ] `Hero` (GSAP mantido, nova paleta)
- [ ] `Features`
- [ ] `HowItWorks`
- [ ] `Testimonials`

### Fase 6 — Vendedor
- [ ] `SellerDashboard`
- [ ] `ProductsPage`
- [ ] `SalesPage`
- [ ] `AnalyticsPage`
- [ ] `QRCodesPage` — **conectar rota** `/seller/qr-codes`
- [ ] `SettingsPage` — **conectar rota** `/seller/settings`
- [ ] `ProfilePage` (compartilhada)
- [ ] `ProductCard`, `ProductForm`
- [ ] `QRCodeDisplay`
- [ ] `SalesChart`

### Fase 7 — Comprador
- [ ] `BuyerDashboard` (scanner + checkout PIX/cartão — **lógica preservada**)
- [ ] `PurchasesPage`
- [ ] `HistoryPage`
- [ ] `PurchaseCard`, `QRScanner`, `ProfileForm`

### Fase 8 — Públicas + erros
- [ ] `ProductPublicPage` (detalhe via QR)
- [ ] `AboutPage`, `ContactPage`, `HelpPage`
- [ ] `TermsPage`, `PrivacyPage`
- [ ] `NotFoundPage`, `ServerErrorPage`

### Fase 9 — QA
- [ ] `npm run build` (tsc + vite) sem erros
- [ ] `npm run lint` limpo
- [ ] Dark mode em todas as telas
- [ ] Fluxos sem regressão: auth/Google, CRUD produtos, scan QR, checkout, histórico/CSV
- [ ] Responsividade mobile (bottom nav) e desktop (sidebar)

---

## Progresso

Todas as fases foram concluídas. Status final:

### Resultado do QA
- **Build**: `npm run build` (tsc + vite) passa sem erros.
- **Lint**: 0 erros em todos os arquivos refatorados (`src/components`, `src/pages`, `src/App.tsx`).
  Os 24 erros remanescentes do `npm run lint` estão **pré-existentes** em arquivos preservados
  por contrato (`services/api.ts`, `services/mock/mockApi.ts`, `utils/export.ts`, `utils/validators.ts`)
  — todos `no-explicit-any`, não introduzidos pela refatoração.
- **Emojis/ícones**: nenhum emoji unicode ou gesto emoji-like (`faHand`/`animate-wave`) no código.
- **Cores**: nenhuma cor hardcoded (`#4169E1`/`#0047AB`) — todas via tokens.
- **Dark mode**: consolidado via tokens semânticos (`bg-surface`, `text-main`, `border-default`).

### O que foi feito (resumo)
- **Design tokens** novos (paleta Cobalt & Amber) + dark mode consolidado.
- **Design system** refatorado (15 componentes) + **11 novos** (Icon, Textarea, IconButton, Avatar,
  Tabs, EmptyState, StatCard, SearchInput, Rating, Drawer, Breadcrumb, Tooltip).
- **Layout system** reescrito: `AppShell` responsivo com **BottomNav (mobile)** + **Sidebar (desktop)**
  a partir de uma **config de navegação única**, corrigindo o bug crítico de layouts não conectados
  (rotas aninhadas com `<Outlet/>`).
- **Auth** com layout split desktop / full-screen mobile + Google Sign-in.
- **Landing** reconstruída com a nova identidade (GSAP preservado).
- **Vendedor**: dashboard, produtos, vendas, analytics + **QR Codes e Settings conectados** (rotas novas).
- **Comprador**: scanner + checkout PIX/cartão (lógica 100% preservada), compras, histórico.
- **Públicas**: product, about, contact, help, terms, privacy + páginas de erro.
- **Removido**: `App.css` (template Vite), `SellerLayout`/`BuyerLayout`/`SellerSidebar`/`BuyerSidebar`
  (substituídos por `AppShell`/`Sidebar`).

