import { useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faClockRotateLeft,
  faBagShopping,
  faCalendarDay,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { usePurchases } from '@/hooks/usePurchases';
import { Spinner } from '@/components/common/Spinner';
import { Select } from '@/components/common/Select';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { Alert } from '@/components/common/Alert';
import { SearchInput } from '@/components/common/SearchInput';
import { IconButton } from '@/components/common/IconButton';
import { exportPurchasesToCSV } from '@/utils/export';

const currency = (value: number, curr = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: curr }).format(value);

const STATUS_CONFIG: Record<string, { label: string; variant: 'warning' | 'success' | 'error' | 'info' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  completed: { label: 'Concluído', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'error' },
  refunded: { label: 'Reembolsado', variant: 'error' },
  PENDING: { label: 'Pendente', variant: 'warning' },
  COMPLETED: { label: 'Concluído', variant: 'success' },
  CANCELLED: { label: 'Cancelado', variant: 'error' },
  REFUNDED: { label: 'Reembolsado', variant: 'error' },
};

export default function HistoryPage() {
  const { purchases, fetchPurchases } = usePurchases();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 8;

  useEffect(() => {
    const loadPurchases = async () => {
      setIsLoading(true);
      setError('');
      try {
        await fetchPurchases();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
      } finally {
        setIsLoading(false);
      }
    };
    loadPurchases();
  }, [fetchPurchases]);

  const filteredPurchases = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return purchases.filter((purchase) => {
      const productName = purchase.product?.name?.toLowerCase() || '';
      const statusLabel = purchase.status.toLowerCase();
      const id = purchase.id.toLowerCase();
      return id.includes(searchLower) || productName.includes(searchLower) || statusLabel.includes(searchLower);
    });
  }, [purchases, searchTerm]);

  const sortedPurchases = useMemo(() => {
    return [...filteredPurchases].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison =
          new Date(a.purchaseDate || a.createdAt).getTime() -
          new Date(b.purchaseDate || b.createdAt).getTime();
      } else if (sortBy === 'status') comparison = a.status.localeCompare(b.status);
      else if (sortBy === 'price') comparison = a.price - b.price;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredPurchases, sortBy, sortOrder]);

  const totalPages = Math.ceil(sortedPurchases.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPurchases = sortedPurchases.slice(startIndex, startIndex + pageSize);

  // Reseta a paginação quando filtros/ordenação mudam.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const statusMap = (status: string) => STATUS_CONFIG[status] || { label: status, variant: 'info' as const };

  if (isLoading && purchases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-primary">
        <Spinner size="lg" />
        <p className="mt-3 text-text-muted text-sm">Carregando seu histórico de transações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <FontAwesomeIcon icon={faClockRotateLeft} className="w-3.5 h-3.5" />
            Histórico
          </span>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-main tracking-tight">
            Suas transações
          </h1>
          <p className="text-text-muted mt-1">
            Acompanhe todas as suas compras, pagamentos e status de pedidos.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => exportPurchasesToCSV(sortedPurchases, 'historico-compras.csv')}
          disabled={sortedPurchases.length === 0}
          leftIcon={<FontAwesomeIcon icon={faDownload} />}
        >
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card flush>
        <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <SearchInput
              placeholder="Buscar por produto, ID ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <Select
            aria-label="Ordenar por"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'price')}
            options={[
              { value: 'date', label: 'Ordenar por: Data' },
              { value: 'status', label: 'Ordenar por: Status' },
              { value: 'price', label: 'Ordenar por: Preço' },
            ]}
          />
          <Select
            aria-label="Ordem"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            options={[
              { value: 'desc', label: 'Mais recentes' },
              { value: 'asc', label: 'Mais antigos' },
            ]}
          />
        </div>
      </Card>

      {/* Erro */}
      {error && (
        <Alert variant="error" title="Ops! Ocorreu um erro">
          {error}
          <button
            onClick={() => fetchPurchases()}
            className="ml-2 underline underline-offset-2 font-semibold"
          >
            Tentar novamente
          </button>
        </Alert>
      )}

      {/* Lista */}
      <Card flush>
        {sortedPurchases.length === 0 ? (
          <EmptyState
            icon={<FontAwesomeIcon icon={faBagShopping} />}
            title={searchTerm ? 'Nenhum resultado encontrado' : 'Ainda não há transações'}
            description={
              searchTerm
                ? `Não encontramos nada para "${searchTerm}". Tente ajustar seus filtros.`
                : 'Suas futuras compras aparecerão aqui assim que você realizar seu primeiro pedido.'
            }
            action={
              searchTerm ? (
                <Button variant="outline" onClick={() => setSearchTerm('')}>
                  Limpar busca
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Tabela desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-surface-sunken/60">
                  <tr>
                    {['Produto', 'Data', 'Valor', 'Status', ''].map((h, i) => (
                      <th
                        key={i}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedPurchases.map((purchase) => {
                    const status = statusMap(purchase.status);
                    return (
                      <tr key={purchase.id} className="hover:bg-surface-hover transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-surface-sunken">
                              {purchase.product?.imageUrl ? (
                                <img
                                  src={purchase.product.imageUrl}
                                  alt={purchase.product.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-text-subtle">
                                  <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-text-main truncate">
                                {purchase.product?.name || 'Produto indisponível'}
                              </div>
                              <div className="text-xs text-text-subtle font-mono">
                                #{purchase.id.slice(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-sm text-text-muted">
                          <span className="inline-flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCalendarDay} className="w-3.5 h-3.5 text-text-subtle" />
                            {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-text-main">
                            {currency(purchase.price, purchase.currency)}
                          </div>
                          {purchase.paymentMethod && (
                            <div className="text-[10px] uppercase font-semibold text-text-subtle">
                              via {purchase.paymentMethod}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <Badge variant={status.variant} dot>{status.label}</Badge>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                          <IconButton label="Ver detalhes">
                            <FontAwesomeIcon icon={faArrowRight} />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards mobile */}
            <ul className="md:hidden divide-y divide-border">
              {paginatedPurchases.map((purchase) => {
                const status = statusMap(purchase.status);
                return (
                  <li key={purchase.id} className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden bg-surface-sunken">
                        {purchase.product?.imageUrl ? (
                          <img
                            src={purchase.product.imageUrl}
                            alt={purchase.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-text-subtle">
                            <FontAwesomeIcon icon={faBagShopping} className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-main truncate">
                          {purchase.product?.name || 'Produto indisponível'}
                        </p>
                        <p className="text-xs text-text-subtle">
                          {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={status.variant} dot>{status.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-main">
                        {currency(purchase.price, purchase.currency)}
                      </span>
                      <IconButton label="Ver detalhes">
                        <FontAwesomeIcon icon={faArrowRight} />
                      </IconButton>
                    </div>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  totalItems={filteredPurchases.length}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
