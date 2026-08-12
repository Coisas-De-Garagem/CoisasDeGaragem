import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTags,
  faDownload,
  faReceipt,
  faMoneyBillWave,
  faClock,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons';
import { usePurchases } from '@/hooks/usePurchases';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { DropdownSelect } from '@/components/common/DropdownSelect';
import { Skeleton } from '@/components/common/Skeleton';
import { StatCard } from '@/components/common/StatCard';
import { SearchInput } from '@/components/common/SearchInput';
import { EmptyState } from '@/components/common/EmptyState';
import {
  PageHeaderSkeleton,
  StatGridSkeleton,
  TableSkeleton,
} from '@/components/common/PageSkeletons';

const currency = (value: number, curr = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: curr }).format(value);

const STATUS_LABEL: Record<string, string> = {
  completed: 'Concluído',
  pending: 'Pendente',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
};

function statusVariant(status: string): 'success' | 'warning' | 'error' | 'gray' {
  if (status === 'completed') return 'success';
  if (status === 'pending') return 'warning';
  if (status === 'cancelled' || status === 'refunded') return 'error';
  return 'gray';
}

export default function SalesPage() {
  const { user } = useAuthStore();
  const { purchases, fetchSales } = usePurchases();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchSales();
      } catch (error) {
        console.error('Falha ao carregar vendas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchSales]);

  const filteredSales = useMemo(() => {
    if (!user) return [];
    return purchases.filter((purchase) => {
      if (purchase.sellerId !== user.id) return false;
      if (
        searchTerm &&
        !purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !purchase.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== 'all' && purchase.status !== statusFilter) return false;

      if (dateRange !== 'all') {
        const date = new Date(purchase.purchaseDate);
        const now = new Date();
        if (dateRange === 'today' && date.toDateString() !== now.toDateString()) return false;
        else if (dateRange === 'week') {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          if (date < weekAgo) return false;
        } else if (dateRange === 'month') {
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          if (date < monthAgo) return false;
        }
      }
      return true;
    });
  }, [purchases, user, searchTerm, statusFilter, dateRange]);

  const stats = useMemo(() => {
    const total = filteredSales.length;
    const revenue = filteredSales.reduce((acc, curr) => acc + curr.price, 0);
    const pending = filteredSales.filter((s) => s.status === 'pending').length;
    const completed = filteredSales.filter((s) => s.status === 'completed').length;
    return { total, revenue, pending, completed };
  }, [filteredSales]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <StatGridSkeleton count={4} />
        <Card flush>
          <div className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <Skeleton height="h-10" rounded="rounded-md" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton height="h-10" width="w-44" rounded="rounded-md" />
              <Skeleton height="h-10" width="w-44" rounded="rounded-md" />
            </div>
          </div>
        </Card>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main">Minhas vendas</h1>
        <p className="text-text-muted mt-1">
          Gerencie e acompanhe o desempenho das suas vendas
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Vendas totais" value={stats.total} tone="primary" icon={<FontAwesomeIcon icon={faTags} />} />
        <StatCard label="Receita total" value={currency(stats.revenue)} tone="success" icon={<FontAwesomeIcon icon={faMoneyBillWave} />} />
        <StatCard label="Pendentes" value={stats.pending} tone="warning" icon={<FontAwesomeIcon icon={faClock} />} />
        <StatCard label="Concluídas" value={stats.completed} tone="info" icon={<FontAwesomeIcon icon={faCircleCheck} />} />
      </div>

      {/* Filtros */}
      <Card flush overflowVisible className="relative z-40">
        <div className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por nome do produto ou ID da venda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="w-full sm:w-48 z-20">
              <DropdownSelect
                value={statusFilter}
                onChange={(v) => setStatusFilter(v)}
                options={[
                  { value: 'all', label: 'Todos os status' },
                  { value: 'completed', label: 'Concluído' },
                  { value: 'pending', label: 'Pendente' },
                  { value: 'cancelled', label: 'Cancelado' },
                ]}
              />
            </div>
            <div className="w-full sm:w-48 z-10">
              <DropdownSelect
                value={dateRange}
                onChange={(v) => setDateRange(v)}
                options={[
                  { value: 'all', label: 'Todo o período' },
                  { value: 'today', label: 'Hoje' },
                  { value: 'week', label: 'Última semana' },
                  { value: 'month', label: 'Último mês' },
                ]}
              />
            </div>
            <Button variant="outline" leftIcon={<FontAwesomeIcon icon={faDownload} />}>
              Exportar CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabela / lista */}
      <Card flush>
        {filteredSales.length === 0 ? (
          <EmptyState
            icon={<FontAwesomeIcon icon={faReceipt} />}
            title="Nenhuma venda encontrada"
            description="Ainda não há vendas com os filtros selecionados."
          />
        ) : (
          <>
            {/* Desktop: tabela */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-sunken/60">
                  <tr>
                    {['ID', 'Data', 'Valor', 'Status', ''].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-text-main whitespace-nowrap">
                        #{sale.id.split('-')[1]}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-text-muted whitespace-nowrap">
                        {new Date(sale.purchaseDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-text-main whitespace-nowrap">
                        {currency(sale.price, sale.currency)}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={statusVariant(sale.status)} dot>
                          {STATUS_LABEL[sale.status] ?? sale.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Button variant="ghost" size="sm">Detalhes</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards */}
            <ul className="md:hidden divide-y divide-border">
              {filteredSales.map((sale) => (
                <li key={sale.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-text-main">
                      #{sale.id.split('-')[1]}
                    </span>
                    <Badge variant={statusVariant(sale.status)} dot>
                      {STATUS_LABEL[sale.status] ?? sale.status}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {new Date(sale.purchaseDate).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="text-sm font-semibold text-text-main">
                      {currency(sale.price, sale.currency)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
