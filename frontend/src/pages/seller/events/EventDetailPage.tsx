import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faBox,
  faQrcode,
  faChartLine,
  faPencil,
  faTrash,
  faPlus,
  faLink,
  faMoneyBillWave,
  faTags,
  faBullseye,
  faEye,
  faTicket,
} from '@fortawesome/free-solid-svg-icons';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { StatCard } from '@/components/common/StatCard';
import { Tabs } from '@/components/common/Tabs';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { ShareButton } from '@/components/common/ShareButton';
import { EventForm } from '@/components/seller/EventForm';
import { useEvents } from '@/hooks/useEvents';
import { useProducts } from '@/hooks/useProducts';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import type { EventInsights, Product, CreateEventRequest, UpdateEventRequest } from '@/types';
import { EVENT_STATUS_CONFIG, formatEventDateRange } from './eventHelpers';

type TabKey = 'products' | 'qr' | 'insights';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEvent, removeEvent, editEvent, selectedEvent } = useEvents();
  const { products } = useProducts();
  const { addNotification } = useUIStore();
  const [activeTab, setActiveTab] = useState<TabKey>('products');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const notify = makeNotifier(addNotification);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        await fetchEvent(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar evento');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton height="h-8" width="w-64" />
        <Card className="p-5 space-y-3">
          <Skeleton height="h-5" width="w-3/4" />
          <Skeleton height="h-3" width="w-1/2" />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <Skeleton height="h-24" rounded="rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !selectedEvent) {
    return (
      <Card>
        <EmptyState
          icon={<FontAwesomeIcon icon={faBox} />}
          title="Evento não encontrado"
          description={error || 'Não conseguimos carregar este evento.'}
          action={<Button variant="primary" onClick={() => navigate('/seller/events')}>Voltar</Button>}
        />
      </Card>
    );
  }

  const event = selectedEvent;
  const cfg = EVENT_STATUS_CONFIG[event.status];
  const shareUrl = `${window.location.origin}/event/${event.id}`;
  const shareMessage = `🏷️ ${event.name} — ${event.description || 'Garage sale com vários produtos à venda!'} Confira:`;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeEvent(event.id);
      notify('success', 'Evento excluído', 'O evento foi removido com sucesso.');
      navigate('/seller/events');
    } catch (err) {
      notify('error', 'Erro ao excluir', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditSubmit = async (data: CreateEventRequest | UpdateEventRequest) => {
    setIsSubmitting(true);
    try {
      await editEvent(event.id, data);
      notify('success', 'Evento atualizado', 'As alterações foram salvas.');
      setIsEditOpen(false);
    } catch (err) {
      notify('error', 'Erro ao salvar', err instanceof Error ? err.message : 'Tente novamente.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { value: 'products', label: 'Produtos', icon: <FontAwesomeIcon icon={faBox} /> },
    { value: 'qr', label: 'QR & Compartilhar', icon: <FontAwesomeIcon icon={faQrcode} /> },
    { value: 'insights', label: 'Insights', icon: <FontAwesomeIcon icon={faChartLine} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/seller/events')}
          leftIcon={<FontAwesomeIcon icon={faArrowLeft} />}
          className="mb-3"
        >
          Voltar
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-main truncate">{event.name}</h1>
              <Badge variant={cfg.variant}>{cfg.label}</Badge>
            </div>
            <p className="text-sm text-text-muted flex items-center gap-2">
              <FontAwesomeIcon icon={faQrcode} className="w-3.5 h-3.5" />
              {formatEventDateRange(event.startDate, event.endDate)}
              {event.city && <span>· {event.city}</span>}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              leftIcon={<FontAwesomeIcon icon={faPencil} />}
            >
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<FontAwesomeIcon icon={faTrash} />}
              className="text-error hover:bg-error/10"
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>

      <Tabs items={tabs} value={activeTab} onChange={(v) => setActiveTab(v as TabKey)} />

      {activeTab === 'products' && (
        <ProductsTab eventId={event.id} allProducts={products} />
      )}
      {activeTab === 'qr' && (
        <QrTab eventId={event.id} shareUrl={shareUrl} shareMessage={shareMessage} eventName={event.name} />
      )}
      {activeTab === 'insights' && <InsightsTab eventId={event.id} />}

      {/* Modal: editar evento */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Editar evento"
        size="lg"
      >
        <EventForm
          event={event}
          onSubmit={handleEditSubmit}
          onCancel={() => setIsEditOpen(false)}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Excluir evento"
        description="Tem certeza que deseja excluir este evento? Os produtos serão desvinculados e esta ação não pode ser desfeita."
        confirmLabel="Sim, excluir"
        danger
        isLoading={isDeleting}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Aba: Produtos
// ---------------------------------------------------------------------------
function ProductsTab({ eventId, allProducts }: { eventId: string; allProducts: Product[] }) {
  const { linkProduct, unlinkProduct } = useEvents();
  const { addNotification } = useUIStore();
  const [eventProducts, setEventProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const notify = makeNotifier(addNotification);

  const loadEventProducts = async () => {
    setLoading(true);
    try {
      const result = await api.getEvent(eventId);
      if (result.success) {
        const productsResult = await api.getMyProducts();
        if (productsResult.success) {
          const linked = (Array.isArray(productsResult.data)
            ? productsResult.data
            : productsResult.data?.products || []
          ).filter((p: Product) => p.eventId === eventId);
          setEventProducts(linked);
        }
      }
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const availableToLink = allProducts.filter(
    (p) => p.isAvailable && !p.isReserved && !p.isSold && !p.eventId,
  );

  const handleLink = async (productId: string) => {
    setActionLoading(productId);
    try {
      await linkProduct(eventId, productId);
      await loadEventProducts();
      notify('success', 'Produto vinculado', 'O produto foi adicionado ao evento.');
    } catch (err) {
      notify('error', 'Erro ao vincular', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnlink = async (productId: string) => {
    setActionLoading(productId);
    try {
      await unlinkProduct(eventId, productId);
      setEventProducts((prev) => prev.filter((p) => p.id !== productId));
      notify('success', 'Produto desvinculado', 'O produto foi removido do evento.');
    } catch (err) {
      notify('error', 'Erro ao desvincular', err instanceof Error ? err.message : 'Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-2">
            <Skeleton height="h-5" width="w-3/4" />
            <Skeleton height="h-3" width="w-1/2" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Produtos vinculados */}
      <div>
        <h2 className="text-sm font-semibold text-text-main uppercase tracking-wide mb-3">
          Produtos no evento ({eventProducts.length})
        </h2>
        {eventProducts.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FontAwesomeIcon icon={faBox} />}
              title="Nenhum produto vinculado"
              description="Vincule produtos disponíveis abaixo para que apareçam na vitrine do evento."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventProducts.map((product) => (
              <Card key={product.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-text-main truncate">{product.name}</h3>
                    <p className="text-lg font-bold text-primary mt-0.5">
                      {formatCurrency(Number(product.price))}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlink(product.id)}
                    isLoading={actionLoading === product.id}
                    className="text-error hover:bg-error/10"
                  >
                    Desvincular
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Produtos disponíveis para vincular */}
      {availableToLink.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-text-main uppercase tracking-wide mb-3">
            Disponíveis para vincular ({availableToLink.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableToLink.map((product) => (
              <Card key={product.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-text-main truncate">{product.name}</h3>
                    <p className="text-lg font-bold text-primary mt-0.5">
                      {formatCurrency(Number(product.price))}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLink(product.id)}
                    isLoading={actionLoading === product.id}
                    leftIcon={<FontAwesomeIcon icon={faPlus} />}
                  >
                    Vincular
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Aba: QR & Compartilhar
// ---------------------------------------------------------------------------
function QrTab({
  eventId,
  shareUrl,
  shareMessage,
  eventName,
}: {
  eventId: string;
  shareUrl: string;
  shareMessage: string;
  eventName: string;
}) {
  const [qrData, setQrData] = useState<{ url: string; eventUrl: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.getEventQR(eventId);
        if (result.success) {
          setQrData({ url: result.data.url, eventUrl: result.data.eventUrl });
        }
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-main">QR Code do evento</h2>
        </div>
        <div className="p-6 flex flex-col items-center">
          {loading ? (
            <div className="w-56 h-56 flex items-center justify-center">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : qrData ? (
            <>
              <div className="w-56 h-56 bg-white rounded-xl p-2 shadow-sm">
                <img src={qrData.url} alt="QR Code do evento" className="w-full h-full object-contain" />
              </div>
              <p className="mt-4 text-sm text-text-muted text-center">
                Aponte a câmera para abrir a vitrine do evento.
              </p>
              <a
                href={qrData.url}
                download={`qr-${eventName}.png`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4"
              >
                <Button variant="outline" leftIcon={<FontAwesomeIcon icon={faLink} />}>
                  Baixar QR Code
                </Button>
              </a>
            </>
          ) : (
            <p className="text-sm text-text-muted">Não foi possível gerar o QR Code.</p>
          )}
        </div>
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-main">Compartilhar</h2>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-text-muted">
            Divulgue seu garage sale! O link abre a vitrine pública com todos os produtos do evento.
          </p>
          <ShareButton
            url={shareUrl}
            title={eventName}
            message={shareMessage}
            variant="primary"
            label="Compartilhar evento"
            fullWidth
          />
          <div className="bg-surface-sunken/60 rounded-lg p-3">
            <p className="text-xs font-medium text-text-subtle uppercase tracking-wide mb-1">
              Link da vitrine
            </p>
            <p className="text-sm text-text-main break-all font-mono">{shareUrl}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Aba: Insights
// ---------------------------------------------------------------------------
function InsightsTab({ eventId }: { eventId: string }) {
  const [insights, setInsights] = useState<EventInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await api.getEventInsights(eventId);
        if (result.success) setInsights(result.data);
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface rounded-xl border border-border shadow-sm p-5">
            <Skeleton height="h-3" width="w-24" className="mb-2" />
            <Skeleton height="h-6" width="w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <Card>
        <EmptyState
          icon={<FontAwesomeIcon icon={faChartLine} />}
          title="Sem dados suficientes"
          description="Os insights aparecerão quando o evento tiver produtos vinculados e vendas."
        />
      </Card>
    );
  }

  const m = insights.metrics;
  const rankingData = insights.productRanking.slice(0, 5).map((r) => ({
    name: r.name.length > 14 ? `${r.name.slice(0, 14)}…` : r.name,
    Vendas: r.qty,
  }));

  const formatDelta = (delta: number | null) => {
    if (delta === null) return null;
    const sign = delta >= 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}%`;
  };
  const revDelta = formatDelta(insights.comparison.revenueDelta);

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Receita total" value={formatCurrency(m.totalRevenue)} tone="success" icon={<FontAwesomeIcon icon={faMoneyBillWave} />} hint={revDelta ? `${revDelta} vs. eventos anteriores` : undefined} />
        <StatCard label="Vendas" value={m.salesCount} tone="primary" icon={<FontAwesomeIcon icon={faTags} />} />
        <StatCard label="Ticket médio" value={formatCurrency(m.ticketAverage)} tone="info" icon={<FontAwesomeIcon icon={faTicket} />} />
        <StatCard label="Conversão" value={`${m.conversionRate.toFixed(0)}%`} tone="accent" icon={<FontAwesomeIcon icon={faBullseye} />} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Produtos listados" value={m.productsListed} tone="gray" />
        <StatCard label="Produtos vendidos" value={m.productsSold} tone="gray" />
        <StatCard label="Scans do QR" value={m.scansCount} tone="info" icon={<FontAwesomeIcon icon={faEye} />} />
        <StatCard label="Eventos anteriores" value={insights.comparison.previousEventsCount} tone="gray" />
      </div>

      {/* Ranking */}
      <Card>
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-main">Produtos mais vendidos</h2>
        </div>
        <div className="p-4 h-[300px]">
          {rankingData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-sm text-text-muted">Nenhuma venda registrada ainda.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rankingData} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                  }}
                  cursor={{ fill: 'var(--color-surface-hover)' }}
                />
                <Bar dataKey="Vendas" fill="#1f47f5" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
