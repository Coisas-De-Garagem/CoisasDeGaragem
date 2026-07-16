import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDays,
  faLocationDot,
  faBoxOpen,
  faCircleExclamation,
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import { api } from '@/services/api';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ShareButton } from '@/components/common/ShareButton';
import { EVENT_STATUS_CONFIG, formatEventDateRange } from '@/pages/seller/events/eventHelpers';
import { formatProductCondition, getConditionVariant } from '@/utils/formatters';
import type { PublicEvent } from '@/types';

const currency = (value: number, curr = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: curr }).format(value);

export default function EventPublicPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        // Registra a visita (scan) para os insights do vendedor.
        api.recordEventVisit(id).catch(() => {});
        const result = await api.getPublicEvent(id);
        if (result.success) {
          setEvent(result.data);
        } else {
          setError(result.error.message);
        }
      } catch {
        setError('Erro ao carregar evento');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Skeleton height="h-10" width="w-2/3" className="mb-3" />
        <Skeleton height="h-4" width="w-1/2" className="mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton height="h-32" rounded="rounded-lg" />
              <Skeleton height="h-5" width="w-3/4" />
              <Skeleton height="h-4" width="w-1/3" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <EmptyState
            icon={<FontAwesomeIcon icon={faCircleExclamation} />}
            title="Evento não encontrado"
            description={error || 'O garage sale que você procura pode ter sido removido.'}
            action={<Button variant="primary" onClick={() => (window.location.href = '/')}>Voltar ao início</Button>}
          />
        </Card>
      </div>
    );
  }

  const products = event.products || [];
  const cfg = EVENT_STATUS_CONFIG[event.status];
  const isShoppingEnabled = event.status === 'ACTIVE' || event.status === 'PUBLISHED';
  const shareUrl = `${window.location.origin}/event/${event.id}`;
  const shareMessage = `🏷️ ${event.name} — ${event.description || 'Garage sale com vários produtos à venda!'} Confira:`;

  const fullAddress = [event.street, event.number && `, ${event.number}`, event.district, event.city]
    .filter(Boolean)
    .join(' — ');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <Badge variant={cfg.variant} className="mb-3">{cfg.label}</Badge>
            <h1 className="text-3xl lg:text-4xl font-bold text-text-main tracking-tight">
              {event.name}
            </h1>
            {event.description && (
              <p className="text-text-muted mt-2 max-w-2xl">{event.description}</p>
            )}
          </div>
          <div className="flex-shrink-0">
            <ShareButton
              url={shareUrl}
              title={event.name}
              message={shareMessage}
              variant="primary"
              label="Compartilhar"
            />
          </div>
        </div>

        {/* Meta info */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-text-muted">
          <span className="inline-flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendarDays} className="w-4 h-4 text-text-subtle" />
            {formatEventDateRange(event.startDate, event.endDate)}
          </span>
          {fullAddress && (
            <span className="inline-flex items-center gap-2">
              <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-text-subtle" />
              {fullAddress}
            </span>
          )}
          {event.seller?.name && (
            <span className="inline-flex items-center gap-2">
              <FontAwesomeIcon icon={faStore} className="w-4 h-4 text-text-subtle" />
              {event.seller.name}
            </span>
          )}
        </div>
      </div>

      {/* Aviso de status */}
      {!isShoppingEnabled && (
        <div className="mb-6">
          <Card className="border-warning/30 bg-warning-soft/40">
            <p className="text-sm text-amber-800 dark:text-amber-300 px-2 py-1">
              ⚠️ Este evento ainda não está ativo para compras. Os produtos estão em exibição.
            </p>
          </Card>
        </div>
      )}

      {/* Produtos */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-text-main flex items-center gap-2">
          <FontAwesomeIcon icon={faBoxOpen} className="w-5 h-5 text-primary" />
          Produtos à venda ({products.length})
        </h2>
      </div>

      {products.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FontAwesomeIcon icon={faBoxOpen} />}
            title="Nenhum produto disponível"
            description="O vendedor ainda não vinculou produtos a este evento."
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => {
            const isSold = product.isSold;
            const isReserved = product.isReserved;
            const isAvailable = product.isAvailable && !isReserved && !isSold;
            return (
              <Card key={product.id} flush className="overflow-hidden flex flex-col">
                {/* Imagem */}
                <div className="relative h-44 bg-surface-sunken">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-subtle">
                      <FontAwesomeIcon icon={faBoxOpen} className="w-10 h-10 opacity-40" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    {isSold ? (
                      <Badge variant="error">Vendido</Badge>
                    ) : isReserved ? (
                      <Badge variant="warning">Reservado</Badge>
                    ) : (
                      <Badge variant="success" dot>Disponível</Badge>
                    )}
                  </div>
                </div>

                {/* Detalhes */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-text-main line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-text-muted line-clamp-2 mt-1 flex-1">{product.description}</p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-lg font-bold text-primary">
                      {currency(Number(product.price), product.currency)}
                    </span>
                    {product.condition && (
                      <Badge variant={getConditionVariant(product.condition)}>
                        {formatProductCondition(product.condition)}
                      </Badge>
                    )}
                  </div>

                  {isAvailable && isShoppingEnabled && (
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      className="mt-3"
                      onClick={() => {
                        window.location.href = `/product/${product.id}`;
                      }}
                    >
                      Ver detalhes
                    </Button>
                  )}
                  {isAvailable && !isShoppingEnabled && (
                    <Button variant="outline" size="sm" fullWidth className="mt-3" disabled>
                      Indisponível no momento
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-8 text-center text-text-subtle text-xs">
        Garage sale organizado via CoisasDeGaragem
      </p>
    </div>
  );
}
