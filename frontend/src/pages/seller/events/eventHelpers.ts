import type { EventStatus } from '@/types';

export const EVENT_STATUS_CONFIG: Record<
  EventStatus,
  { label: string; variant: 'gray' | 'primary' | 'success' | 'warning' | 'error' | 'info' }
> = {
  DRAFT: { label: 'Rascunho', variant: 'gray' },
  PUBLISHED: { label: 'Publicado', variant: 'info' },
  ACTIVE: { label: 'Ativo', variant: 'success' },
  ENDED: { label: 'Encerrado', variant: 'gray' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
};

export const EVENT_STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'ACTIVE', label: 'Ativo' },
  { value: 'ENDED', label: 'Encerrado' },
  { value: 'CANCELLED', label: 'Cancelado' },
];

export function formatEventDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return 'Datas a definir';
  const fmt = (d?: string) =>
    d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
  if (startDate && endDate) return `${fmt(startDate)} → ${fmt(endDate)}`;
  return fmt(startDate || endDate);
}
