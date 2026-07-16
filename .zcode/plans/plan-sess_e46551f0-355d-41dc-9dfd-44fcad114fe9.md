# Plano: Formulários via Modal + remover alerts/confirm + Textarea sem resize

## ETAPA 1 — Textarea: `resize-y` → `resize-none`
`components/common/Textarea.tsx` (linha 39): trocar `resize-y` por `resize-none`. Asim todos os Textareas do sistema ficam sem resize (3 usos: ProductForm, EventFormPage, ContactPage).

## ETAPA 2 — Componente `ConfirmDialog` reutilizável (NOVO)
`components/common/ConfirmDialog.tsx` — wrapper sobre o `Modal` existente para substituir os 2 `window.confirm`. Props: `isOpen`, `onClose`, `onConfirm`, `title`, `description`, `confirmLabel`, `danger?`, `isLoading?`. Renderiza um `Modal size="sm"` com footer de botões Cancelar + confirmar (danger quando aplicável). Usa o design system atual (Button/Modal).

## ETAPA 3 — `ProductForm`: adaptar para caber no Modal
`components/seller/ProductForm.tsx`:
- Separar o rodapé de botões (Cancelar/Salvar) do `<form>` — quando usado dentro de um Modal, os botões vão para o slot `footer`. Adiciono um modo `embedded` (default mantém o comportamento atual com rodapé próprio para compatibilidade) — na prática vou refatorar para que o form expõe um `submitLabel` e renderiza botões via render-prop ou via ref. **Abordagem mais simples:** manter o `ProductForm` renderizando seu próprio `<form>` com os botões, e o Modal que o envolve usa `hideCloseButton={false}` **sem** footer (os botões ficam dentro do body, no próprio form). Isso preserva a validação nativa (submit por Enter, etc.) e exige mudança mínima. O `ProductForm` já tem Cancelar/Salvar — só preciso garantir que o `onCancel` feche o modal.

## ETAPA 4 — `ProductsPage`: form inline → Modal + remover alerts/confirm
- Remover o `if (showForm) { return <form-view> }` (linhas 213-248).
- Adicionar estado `isFormOpen` e `editingProduct`; o "Novo produto" e "Editar" abrem `<Modal size="lg">` contendo `<ProductForm>`.
- O `location.state.showForm` (do dashboard) continua abrindo o modal no mount.
- Substituir os **8 `alert()`** por `addNotification` (toast) do `uiStore` — mapeando tipo (error/warning/success) e mensagem.
- Substituir o `window.confirm` de exclusão pelo `<ConfirmDialog>`.
- QR/PDF: o alert "Gere o QR code antes de baixar o PDF" vira toast `warning`.

## ETAPA 5 — `EventFormPage` (rota) → formulário via Modal em `EventsPage`
- Criar um componente de formulário de evento extraído (reaproveita a UI do `EventFormPage` mas como `<EventForm>` reutilizável dentro de um Modal).
- `EventsPage.tsx`: "Novo evento" e "Editar" abrem `<Modal size="lg">` com o formulário, em vez de navegar para uma rota.
- **Decisão sobre as rotas `/seller/events/new` e `/:id/edit`:** mantê-las como redirecionamento para `/seller/events` + abrir o modal via router state (para não quebrar links/deep-links do dashboard e da página de detalhe). Assim o deep-link ainda funciona abrindo o modal.
- Remover os **3 `alert()`** do `EventDetailPage` por toasts; o `window.confirm` de exclusão vira `<ConfirmDialog>`.

## ETAPA 6 — Verificação
`tsc -b`, `eslint` nos arquivos alterados, `npm run build`. Confirmar: zero `alert(`/`confirm(` restantes, todos Textareas sem resize, formulários abrem em modal.

## Fora de escopo (explicitamente)
- `ContactPage.tsx`: o toggle form↔success não é "criar/editar entidade", é um formulário de contato público com confirmação inline — deixar como está (não é cadastro de entidade).
- `ProfilePage`/`SettingsPage`: ProfileForm já é um card dedicado numa página própria (não é toggle inline) — fora do escopo de "abrir modal ao invés de preencher na mesma tela".
- Notificações push, etc.