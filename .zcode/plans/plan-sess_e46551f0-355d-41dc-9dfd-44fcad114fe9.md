# Plano: Feature de Eventos (Garage Sales) — Full-stack + Compartilhar Link

## Regras de negócio (confirmadas)
- Vínculo produto↔evento: **1-para-1** (campo `eventId` em `Product`), só produtos disponíveis.
- Ciclo de vida: datas início/fim + status (`DRAFT`/`PUBLISHED`/`ACTIVE`/`ENDED`/`CANCELLED`) + editar sempre; excluir só se não houver vendas vinculadas.
- Comprador: QR do evento → vitrine pública `/event/:id`; produtos vendidos/reservados continuam visíveis com badge.
- Insights: financeiras + ranking de produtos + scans do QR (contar todos) + comparativo entre eventos.
- Local: endereço estruturado (rua/número/bairro/cidade/CEP).
- **Compartilhar link com mensagem** (novo): Web Share API nativa no mobile + fallback WhatsApp/Telegram/copiar no desktop, todos com mensagem pré-preenchida.
- Migrate dev por último.

## ETAPA 1 — Backend: Schema Prisma (migração no final)
`prisma/schema.prisma`:
- Novo enum `EventStatus { DRAFT PUBLISHED ACTIVE ENDED CANCELLED }`
- Novo `model GarageEvent` (id, sellerId, name, description?, status, startDate?, endDate?, endereço estruturado, `qrCode @unique`, timestamps, relações products[] e visits[])
- Novo `model EventVisit` (id, eventId, createdAt) — contador de scans
- Em `Product`: `eventId String?` + `event GarageEvent?`
- Em `User`: relação `events GarageEvent[] @relation("SellerEvents")`

## ETAPA 2 — Backend: Módulo events (copia padrão de `products/`)
`backend/src/events/`: module, controller, service, dto/create + dto/update, spec.
- **Service** (PrismaService): create (qrCode=randomUUID), findAllBySeller, findOne (NotFoundException), update (ownership real → ForbiddenException), remove (bloqueia se houver Purchase de produtos do evento → ConflictException), getPublicEvent, recordVisit, linkProduct (valida dono+disponível+sem evento), unlinkProduct, getInsights.
- **Controller** `@Controller('events')`: CRUD guardiado + `POST/DELETE /:id/products/:productId` (vincular/desvincular) + `GET /:id/qr` (padrão api.qrserver.com → FRONTEND_URL/event/:id) + `POST /:id/visit` (público) + `GET /:id/insights`.
- Registrar `EventsModule` em `app.module.ts`.

## ETAPA 3 — Backend: Insights (no service)
Receita total (sum), nº vendas, ticket médio, conversão (vendidos/listados), ranking (groupBy productId), scans (count EventVisit), comparativo vs. média dos eventos anteriores do vendedor.

## ETAPA 4 — Frontend: tipos + api + store + hook
- `types/index.ts`: EventStatus, GarageEvent, EventVisit, CreateEventRequest, UpdateEventRequest, EventInsights.
- `services/api.ts`: getEvents, getEvent, createEvent, updateEvent, deleteEvent, linkProductToEvent, unlinkProductFromEvent, getEventQR, recordEventVisit, getEventInsights, getPublicEvent.
- `store/eventsStore.ts` + `hooks/useEvents.ts` (copia productsStore/useProducts).

## ETAPA 5 — Frontend: Componente ShareButton (reutilizável)
`components/common/ShareButton.tsx`: usa `navigator.share` quando disponível (mobile) com título+texto+url; fallback (desktop) com botões WhatsApp/Telegram (URL com mensagem pré-preenchida) e copiar link (com toast). Consome o toast do uiStore. Design system atual (Button/Card).

## ETAPA 6 — Frontend: Telas do Vendedor
Grupo "Eventos" em `navigation.ts` + rotas em `App.tsx`:
1. `pages/seller/events/EventsPage.tsx` — lista (cards, status badge, datas, nº produtos), "Novo evento", filtros, skeleton, empty state animado.
2. `pages/seller/events/EventFormPage.tsx` — criar/editar (nome, descrição, DatePickers MUI, endereço, status).
3. `pages/seller/events/EventDetailPage.tsx` — abas: Produtos vinculados (vincular/desvincular), QR Code (download/PDF + ShareButton), Insights (StatCards + gráfico ranking + comparativo).

## ETAPA 7 — Frontend: Vitrine pública + compartilhar
`pages/public/EventPublicPage.tsx` rota `/event/:id`: header (nome/local/datas/status) + ShareButton no topo + grid de produtos vinculados com badges + modal de compra (reaproveita lógica existente) + recordEventVisit no mount.

## ETAPA 8 — Migração (por último)
`npx prisma migrate dev --name add_garage_events`.

## Verificação
Backend: build + testes + Swagger. Frontend: tsc -b + eslint + build.