import { useMemo, useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBox,
  faMoneyBillWave,
  faChartLine,
  faTags,
  faClipboardList,
  faUsers,
  faFaceFrown,
  faCalendarDays,
} from '@fortawesome/free-solid-svg-icons';
import { Card } from '@/components/common/Card';
import { StatCard } from '@/components/common/StatCard';
import { Skeleton } from '@/components/common/Skeleton';
import type { AnalyticsData, Purchase } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface SalesChartProps {
  /** Opcional: permite montar o componente (e seu skeleton) antes dos dados chegarem. */
  data?: AnalyticsData;
  purchases: Purchase[];
  loading?: boolean;
}

const PRIMARY = '#1f47f5';

type PeriodKey = '7d' | '30d' | '12m' | 'custom';

interface FastAction {
  key: PeriodKey;
  label: string;
}

const FAST_ACTIONS: FastAction[] = [
  { key: '7d', label: 'Última semana' },
  { key: '30d', label: 'Último mês' },
  { key: '12m', label: 'Último ano' },
];

/** Formato curto de data (YYYY-MM-DD) para inputs nativos type="date". */
function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Bucket por dia (dd/MM), usado para os períodos curtos. */
function buildDailyBuckets(purchases: Purchase[], days: number) {
  const grouped = purchases.reduce((acc, purchase) => {
    const date = new Date(purchase.purchaseDate).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    acc[date] = (acc[date] || 0) + purchase.price;
    return acc;
  }, {} as Record<string, number>);

  const result: { date: string; amount: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    result.push({ date: dateStr, amount: grouped[dateStr] || 0 });
  }
  return result;
}

/** Bucket por mês (mmm/aa), usado para o período de 12 meses. */
function buildMonthlyBuckets(purchases: Purchase[]) {
  const grouped = purchases.reduce((acc, purchase) => {
    const date = new Date(purchase.purchaseDate);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    acc[key] = (acc[key] || 0) + purchase.price;
    return acc;
  }, {} as Record<string, number>);

  const result: { date: string; amount: number }[] = [];
  const today = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    result.push({ date: label, amount: grouped[key] || 0 });
  }
  return result;
}

/** Converte string YYYY-MM-DD para dd/mm/aa (exibição amigável). */
function formatShortDateBr(input: string): string {
  const [y, m, d] = input.split('-');
  if (!y || !m || !d) return input;
  return `${d}/${m}/${y.slice(2)}`;
}

/** Bucket por dia dentro de um intervalo custom (startDate..endDate). */
function buildCustomRangeBuckets(purchases: Purchase[], startDate: Date, endDate: Date) {
  const filtered = purchases.filter((p) => {
    const d = new Date(p.purchaseDate);
    return d >= startDate && d <= endDate;
  });
  const grouped = filtered.reduce((acc, purchase) => {
    const date = new Date(purchase.purchaseDate).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
    acc[date] = (acc[date] || 0) + purchase.price;
    return acc;
  }, {} as Record<string, number>);

  const result: { date: string; amount: number }[] = [];
  const cursor = new Date(startDate);
  // Limita a 366 buckets para evitar sobrecarga visual em intervalos grandes.
  let guard = 0;
  while (cursor <= endDate && guard < 366) {
    const dateStr = cursor.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    result.push({ date: dateStr, amount: grouped[dateStr] || 0 });
    cursor.setDate(cursor.getDate() + 1);
    guard += 1;
  }
  return result;
}

export function SalesChart({ data, purchases, loading = false }: SalesChartProps) {
  const [period, setPeriod] = useState<PeriodKey>('7d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const range = useMemo(() => {
    if (period === 'custom' && customStart && customEnd) {
      const start = new Date(customStart);
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      return buildCustomRangeBuckets(purchases, start, end);
    }
    if (period === '12m') return buildMonthlyBuckets(purchases);
    if (period === '30d') return buildDailyBuckets(purchases, 30);
    return buildDailyBuckets(purchases, 7);
  }, [purchases, period, customStart, customEnd]);

  const subtitle = useMemo(() => {
    switch (period) {
      case '7d':
        return 'Receita dos últimos 7 dias';
      case '30d':
        return 'Receita dos últimos 30 dias';
      case '12m':
        return 'Receita dos últimos 12 meses';
      default:
        if (customStart && customEnd) {
          return `${formatShortDateBr(customStart)} a ${formatShortDateBr(customEnd)}`;
        }
        return 'Selecione um período';
    }
  }, [period, customStart, customEnd]);

  const hasSales = range.some((point) => point.amount > 0);

  const handleFastAction = (key: PeriodKey) => {
    setPeriod(key);
    if (key !== 'custom') {
      setCustomStart('');
      setCustomEnd('');
    }
  };

  const metrics = [
    { label: 'Vendas totais', value: data?.totalSales || 0, icon: <FontAwesomeIcon icon={faBox} />, tone: 'primary' as const },
    { label: 'Receita total', value: formatCurrency(data?.totalRevenue || 0), icon: <FontAwesomeIcon icon={faMoneyBillWave} />, tone: 'success' as const },
    { label: 'Valor listado', value: formatCurrency(data?.totalListingsValue || 0), icon: <FontAwesomeIcon icon={faChartLine} />, tone: 'info' as const },
    { label: 'Produtos vendidos', value: data?.productsSold || 0, icon: <FontAwesomeIcon icon={faTags} />, tone: 'accent' as const },
    { label: 'Produtos listados', value: data?.productsListed || 0, icon: <FontAwesomeIcon icon={faClipboardList} />, tone: 'gray' as const },
    { label: 'Compradores únicos', value: data?.uniqueBuyers || 0, icon: <FontAwesomeIcon icon={faUsers} />, tone: 'warning' as const },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" height="h-24" />
          ))}
        </div>
        <Card><Skeleton height="h-80" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            tone={metric.tone}
          />
        ))}
      </div>

      {/* Gráfico */}
      <Card>
        <div className="px-5 py-4 border-b border-border space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-text-main">Desempenho de vendas</h3>
              <p className="text-sm text-text-muted truncate">{subtitle}</p>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-text-muted bg-surface-sunken px-2.5 py-1 rounded-full flex-shrink-0">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY }} />
              Receita
            </span>
          </div>

          {/* Fast actions */}
          <div className="flex flex-wrap items-center gap-1.5">
            {FAST_ACTIONS.map((action) => (
              <button
                key={action.key}
                type="button"
                onClick={() => handleFastAction(action.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  period === action.key
                    ? 'bg-primary text-white'
                    : 'bg-surface-sunken text-text-muted hover:bg-surface-hover hover:text-text-main'
                }`}
              >
                {action.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPeriod('custom')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                period === 'custom'
                  ? 'bg-primary text-white'
                  : 'bg-surface-sunken text-text-muted hover:bg-surface-hover hover:text-text-main'
              }`}
            >
              <FontAwesomeIcon icon={faCalendarDays} className="w-3 h-3" />
              Personalizado
            </button>
          </div>

          {/* Datepickers MUI (visíveis no modo personalizado) */}
          {period === 'custom' && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-muted">De</span>
                <div className="w-[150px]">
                  <DatePicker
                    value={customStart ? dayjs(customStart) : null}
                    maxDate={customEnd ? dayjs(customEnd) : dayjs()}
                    onChange={(value: Dayjs | null) =>
                      setCustomStart(value ? toInputDate(value.toDate()) : '')
                    }
                    slotProps={{
                      textField: { size: 'small' },
                      field: { clearable: true },
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-text-muted">Até</span>
                <div className="w-[150px]">
                  <DatePicker
                    value={customEnd ? dayjs(customEnd) : null}
                    minDate={customStart ? dayjs(customStart) : undefined}
                    maxDate={dayjs()}
                    onChange={(value: Dayjs | null) =>
                      setCustomEnd(value ? toInputDate(value.toDate()) : '')
                    }
                    slotProps={{
                      textField: { size: 'small' },
                      field: { clearable: true },
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Área do gráfico ou empty state */}
        {hasSales ? (
          <div className="p-4 h-[320px] sm:h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={range} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PRIMARY} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip
                  cursor={{ stroke: PRIMARY, strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text-main)',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Receita']}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={PRIMARY}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: PRIMARY }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptySalesPeriod hasCustomRange={period === 'custom' && !!customStart && !!customEnd} />
        )}
      </Card>
    </div>
  );
}

/** Estado vazio animado: nenhuma venda no período selecionado. */
function EmptySalesPeriod({ hasCustomRange }: { hasCustomRange: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-4 animate-fade-in">
      <div className="relative animate-float-soft mb-5">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-warning/10 text-amber-500 dark:text-amber-400 [&_svg]:w-10 [&_svg]:h-10 animate-sad-drop">
          <FontAwesomeIcon icon={faFaceFrown} />
        </div>
        {/* "Gotículas" decorativas sugerindo uma carinha triste suando */}
        <span className="absolute -top-1 -left-2 w-2 h-3 rounded-full bg-warning/30 animate-float-soft" style={{ animationDelay: '0.4s' }} />
        <span className="absolute -top-1 -right-2 w-2 h-3 rounded-full bg-warning/30 animate-float-soft" style={{ animationDelay: '0.7s' }} />
      </div>
      <h4 className="text-base font-semibold text-text-main">Nenhuma venda nesse período</h4>
      <p className="mt-1 text-sm text-text-muted max-w-sm">
        {hasCustomRange
          ? 'Não encontramos vendas no intervalo selecionado. Tente ampliar as datas ou confira outro período.'
          : 'Não registramos vendas neste período. Que tal anunciar novos produtos para atrair compradores?'}
      </p>
    </div>
  );
}
