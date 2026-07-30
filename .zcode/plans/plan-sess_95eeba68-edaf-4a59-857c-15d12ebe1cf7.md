# Plano de Refatoração Completa do Frontend — CoisasDeGaragem

## Objetivo
Refatorar **todo** o frontend (UI + UX) do marketplace de garage sales, inspirado em grandes marketplaces (Mercado Livre, Shopee, OLX), com **2 designs distintos e dedicados**: mobile (bottom navigation) e desktop (sidebar). Sem quebrar nenhuma funcionalidade. **Zero emojis — somente ícones** (Font Awesome). Tudo em pt-BR.

## Decisões já alinhadas com você
- **Paleta**: nova paleta em **tons de azul** (cobalto/azure moderno, mais marcante que o azul Tailwind genérico atual) + acento **âmbar** (energia "etiqueta/garage sale", inspirado no amarelo do Mercado Livre).
- **Mobile**: bottom navigation tab bar (estilo app Shopee/Mercado Livre).
- **Desktop**: sidebar lateral fixa.
- **Escopo**: refatoração completa de uma vez, em fases.
- **Páginas órfãs** (QRCodesPage, SettingsPage): receberão rotas e serão refatoradas.

---

## Fase 0 — Plano + auditoria (execução)
1. Criar **`frontend/REFACTOR_PLAN.md`** com checklist detalhado de TODAS as telas/componentes (guia durante a execução — seu pedido explícito para "não esquecer de nada").
2. Varrer `src/` em busca de emojis / ícones emoji-like (ex.: `faHand animate-wave` no Header) → lista de substituição por ícones reais.

## Fase 1 — Design tokens e base (`styles/global.css`)
- Nova paleta **"Cobalt & Amber"**: escalas primary (50–950), accent âmbar, neutros com toque quente, semânticos.
- Tokens de espaçamento, raio, sombra, tipografia (Inter/Outfit mantidos).
- **Dark mode consolidado** com tokens semânticos (`bg-background`, `bg-surface`, `text-main`, `border-default`) que trocam sozinhos no dark — acabando com o problema de sidebars/cards sem `dark:`.
- Remover `src/App.css` (sobras do template Vite).

## Fase 2 — Design System (`components/common/`)
Refatorar e padronizar: `Button`, `Card`, `Input`, `Select`, `Modal`, `Alert`, `Badge`, `Spinner`, `Skeleton`, `Pagination`, `ToastContainer`, `DarkModeToggle`.
**Criar** componentes novos para o novo padrão:
- `Textarea`, `IconButton`, `Avatar`, `Tabs`, `EmptyState`, `Stat/KpiCard`, `SearchInput`, `Rating` (estrelas via ícones), `Drawer`, `Breadcrumb`, `Tooltip`.
- Centralizar uso de ícones em `components/common/Icon.tsx` (wrapper FontAwesome) para consistência.

## Fase 3 — Layout System (mobile + desktop dedicados)
- Novo **`AppShell`** responsivo: detecta breakpoint e renderiza `BottomNav` (mobile) ou `Sidebar` (desktop) a partir de **uma única config de navegação** (acaba com a duplicação buyer/seller).
- Refatorar `Header`, `Footer`, `PageLayout`.
- **Corrigir bug crítico de arquitetura**: hoje `SellerLayout`/`BuyerLayout` existem mas **não envolvem as rotas** no `App.tsx` — cada página precisa montar o próprio sidebar. Mover o layout para o roteador (rotas aninhadas com `<Outlet/>`) para que toda página de painel herde o shell automaticamente.
- Bottom nav mobile (máx 5 itens, ícone + label) + top bar enxuta.
- Sidebar desktop com seções, colapsável e com dark mode.

## Fase 4 — Auth (`pages/auth/`)
- `LoginPage` / `RegisterPage`: layout split no desktop (ilustração de um lado, formulário do outro), full-screen no mobile. `LoginForm`/`RegisterForm` refatorados com os novos componentes; Google Sign-in com botão de marca (ícone "G", sem emoji).

## Fase 5 — Landing (`pages/landing/`)
- `LandingPage` + `Hero`, `Features`, `HowItWorks`, `Testimonials`: refazer com a nova identidade, ícones no lugar de qualquer emoji, animações GSAP mantidas e ajustadas à nova paleta.

## Fase 6 — Área do Vendedor
- Refatorar `SellerDashboard`, `ProductsPage`, `SalesPage`, `AnalyticsPage`.
- **Conectar** `QRCodesPage` (`/seller/qr-codes`) e `SettingsPage` (`/seller/settings`) com rotas e refatorá-las.
- Refatorar `ProfilePage` (compartilhada buyer/seller), `ProductCard`, `ProductForm`, `QRCodeDisplay`, `SalesChart`, `SellerSidebar`.

## Fase 7 — Área do Comprador
- Refatorar `BuyerDashboard` (scanner QR + fluxo de pagamento PIX/cartão com countdown e polling — **lógica 100% preservada**), `PurchasesPage`, `HistoryPage`.
- Refatorar `PurchaseCard`, `QRScanner`, `ProfileForm`, `BuyerSidebar`.

## Fase 8 — Públicas + erros
- `ProductPublicPage` (detalhe via QR), `AboutPage`, `ContactPage`, `HelpPage`, `TermsPage`, `PrivacyPage`, `NotFoundPage`, `ServerErrorPage`.

## Fase 9 — QA e validação
- `npm run build` (tsc + vite) e `npm run lint` sem erros.
- Conferir dark mode em todas as telas.
- Validar fluxos críticos sem regressão: login/registro/Google, CRUD de produtos, scan QR, checkout PIX/cartão, histórico/CSV.
- Conferir responsividade mobile (bottom nav) e desktop (sidebar).

---

## Garantias de não-quebra
- **Contrato de API preservado**: não alterar `services/api.ts`, `services/authService.ts`, stores Zustand, hooks, nem `types/index.ts` além do estritamente cosmético.
- **Rotas existentes mantidas** (apenas adicionamos `/seller/qr-codes` e `/seller/settings`).
- **Fluxos de pagamento/QR/scanner** intocados na lógica.

## Como vou executar
Após sua aprovação, começo pela **Fase 0** (crio o `REFACTOR_PLAN.md` detalhado) e sigo fase a fase, marcando progresso no checklist e rodando `build`/`lint` ao longo do caminho para garantir nada quebrado.