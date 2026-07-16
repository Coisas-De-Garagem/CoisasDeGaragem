import { useMemo } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';
import { Card } from '@/components/common/Card';
import { StatCard } from '@/components/common/StatCard';
import { Skeleton } from '@/components/common/Skeleton';
import type { AnalyticsData, Purchase } from '@/types';
import { formatCurrency } from '@/utils/formatters';

interface SalesChartProps {
  data: AnalyticsData;
  purchases: Purchase[];
  loading?: boolean;
}

const PRIMARY = '#1f47f5';

export function SalesChart({ data, purchases, loading = false }: SalesChartProps) {
  const chartData = useMemo(() => {
    if (!purchases.length) return [];
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
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      result.push({ date: dateStr, amount: grouped[dateStr] || 0 });
    }
    return result;
  }, [purchases]);

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
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-text-main">Desempenho de vendas</h3>
            <p className="text-sm text-text-muted">Receita dos últimos 7 dias</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-text-muted bg-surface-sunken px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PRIMARY }} />
            Receita diária
          </span>
        </div>
        <div className="p-4 h-[320px] sm:h-[380px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
      </Card>
    </div>
  );
}
