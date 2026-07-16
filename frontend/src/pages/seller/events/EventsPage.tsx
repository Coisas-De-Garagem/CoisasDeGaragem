import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCalendarDays, faBox, faEye, faPencil, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import { useEvents } from '@/hooks/useEvents';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { PageHeaderSkeleton } from '@/components/common/PageSkeletons';
import type { EventStatus } from '@/types';
import { EVENT_STATUS_CONFIG, EVENT_STATUS_OPTIONS, formatEventDateRange } from './eventHelpers';

export default function EventsPage() {
  const { events, fetchEvents } = useEvents();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        await fetchEvents();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar eventos');
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      if (!loading && containerRef.current) {
        gsap.from('.event-card-item', {
          y: 16,
          opacity: 0,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power3.out',
        });
      }
    },
    { dependencies: [loading], scope: containerRef },
  );

  const filteredEvents =
    statusFilter === 'all' ? events : events.filter((e) => e.status === statusFilter);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-main">Eventos</h1>
          <p className="text-text-muted mt-1">
            Organize garage sales, vincule produtos e acompanhe o desempenho.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/seller/events/new')}
          leftIcon={<FontAwesomeIcon icon={faPlus} />}
        >
          Novo evento
        </Button>
      </div>

      {/* Filtros */}
      <div className="w-44">
        <Select
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'all')}
          options={[
            { value: 'all', label: 'Todos os status' },
            ...EVENT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
          ]}
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          <PageHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-5 space-y-3">
                <Skeleton height="h-5" width="w-2/3" />
                <Skeleton height="h-3" width="w-1/2" />
                <Skeleton height="h-3" width="w-3/4" />
                <div className="flex gap-2 pt-2">
                  <Skeleton height="h-9" width="w-24" rounded="rounded-md" />
                  <Skeleton height="h-9" width="w-24" rounded="rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Erro */}
      {!loading && error && (
        <Card>
          <EmptyState
            icon={<FontAwesomeIcon icon={faCircleExclamation} />}
            title="Ops! Ocorreu um erro."
            description={error}
            action={
              <Button variant="primary" onClick={() => fetchEvents()}>
                Tentar novamente
              </Button>
            }
          />
        </Card>
      )}

      {/* Lista */}
      {!loading && !error && filteredEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.map((event) => {
            const cfg = EVENT_STATUS_CONFIG[event.status];
            return (
              <Card key={event.id} className="event-card-item flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-base font-semibold text-text-main line-clamp-1">
                      {event.name}
                    </h3>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>

                  {event.description && (
                    <p className="text-sm text-text-muted line-clamp-2">{event.description}</p>
                  )}

                  <div className="mt-3 space-y-1.5 text-xs text-text-muted">
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faCalendarDays} className="w-3.5 h-3.5 text-text-subtle" />
                      {formatEventDateRange(event.startDate, event.endDate)}
                    </p>
                    {event.city && (
                      <p className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBox} className="w-3.5 h-3.5 text-text-subtle" />
                        {event.productsCount ?? 0} produtos · {event.city}
                      </p>
                    )}
                    {!event.city && (
                      <p className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBox} className="w-3.5 h-3.5 text-text-subtle" />
                        {event.productsCount ?? 0} produtos
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-border flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/seller/events/${event.id}`)}
                    leftIcon={<FontAwesomeIcon icon={faEye} />}
                    className="flex-1"
                  >
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/seller/events/${event.id}/edit`)}
                    leftIcon={<FontAwesomeIcon icon={faPencil} />}
                  >
                    Editar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Vazio */}
      {!loading && !error && filteredEvents.length === 0 && (
        <Card>
          <EmptyState
            icon={<FontAwesomeIcon icon={faCalendarDays} />}
            title={events.length === 0 ? 'Crie seu primeiro evento' : 'Nenhum evento com esse filtro'}
            description={
              events.length === 0
                ? 'Organize um garage sale, vincule produtos e compartilhe o link com seus clientes.'
                : 'Tente outro filtro de status.'
            }
            action={
              events.length === 0 ? (
                <Button
                  variant="primary"
                  onClick={() => navigate('/seller/events/new')}
                  leftIcon={<FontAwesomeIcon icon={faPlus} />}
                >
                  Criar evento
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setStatusFilter('all')}>
                  Ver todos
                </Button>
              )
            }
          />
        </Card>
      )}
    </div>
  );
}
