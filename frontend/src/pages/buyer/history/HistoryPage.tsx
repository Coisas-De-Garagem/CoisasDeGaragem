import { BuyerLayout } from '@/components/buyer/BuyerLayout';
import { usePurchases } from '@/hooks/usePurchases';
import { Spinner } from '@/components/common/Spinner';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Pagination } from '@/components/common/Pagination';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { exportPurchasesToCSV } from '@/utils/export';
import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faDownload,
  faHistory,
  faCalendarAlt,
  faFilter,
  faShoppingBag,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';

export default function HistoryPage() {
  const { purchases, fetchPurchases } = usePurchases();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 8;

  // Load purchases on mount
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

  // Filter purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const searchLower = searchTerm.toLowerCase();
      const productName = purchase.product?.name?.toLowerCase() || '';
      const statusLabel = purchase.status.toLowerCase();
      const id = purchase.id.toLowerCase();

      return id.includes(searchLower) ||
        productName.includes(searchLower) ||
        statusLabel.includes(searchLower);
    });
  }, [purchases, searchTerm]);

  // Sort filtered purchases
  const sortedPurchases = useMemo(() => {
    return [...filteredPurchases].sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        const dateA = new Date(a.purchaseDate || a.createdAt).getTime();
        const dateB = new Date(b.purchaseDate || b.createdAt).getTime();
        comparison = dateA - dateB;
      } else if (sortBy === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortBy === 'price') {
        comparison = a.price - b.price;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredPurchases, sortBy, sortOrder]);

  // Paginate sorted purchases
  const totalPages = Math.ceil(sortedPurchases.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPurchases = sortedPurchases.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 when search term or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'error' | 'info' }> = {
    pending: { label: 'Pendente', variant: 'warning' },
    completed: { label: 'Concluído', variant: 'success' },
    cancelled: { label: 'Cancelado', variant: 'error' },
    refunded: { label: 'Reembolsado', variant: 'error' },
    // Uppercase support from backend
    PENDING: { label: 'Pendente', variant: 'warning' },
    COMPLETED: { label: 'Concluído', variant: 'success' },
    CANCELLED: { label: 'Cancelado', variant: 'error' },
    REFUNDED: { label: 'Reembolsado', variant: 'error' },
  };

  const statusMap = (status: string) => {
    return statusConfig[status] || { label: status, variant: 'info' as const };
  };

  if (isLoading && purchases.length === 0) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Spinner />
          <p className="mt-4 text-gray-500 font-medium animate-pulse">Carregando seu histórico de transações...</p>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white rounded-3xl p-8 shadow-xl border border-gray-100 ring-1 ring-gray-200">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-primary-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>

          <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-2">
                <FontAwesomeIcon icon={faHistory} />
                <span>Histórico</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
                Suas Transações
              </h1>
              <p className="text-lg text-gray-500 max-w-2xl">
                Acompanhe todas as suas compras, pagamentos e status de pedidos em um só lugar.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="rounded-xl border-gray-200 hover:bg-gray-50 bg-white"
                onClick={() => exportPurchasesToCSV(sortedPurchases, 'historico-compras.csv')}
                disabled={sortedPurchases.length === 0}
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Buscar por produto, ID ou status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 h-12 bg-white border-gray-200 focus:ring-primary-500 focus:border-primary-500 rounded-xl w-full"
              />
            </div>

            <div className="relative">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-12 bg-white border-gray-200 rounded-xl"
                options={[
                  { value: 'date', label: 'Ordenar por: Data' },
                  { value: 'status', label: 'Ordenar por: Status' },
                  { value: 'price', label: 'Ordenar por: Preço' },
                ]}
              />
            </div>

            <div className="relative">
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="h-12 bg-white border-gray-200 rounded-xl"
                options={[
                  { value: 'desc', label: 'Mais recentes' },
                  { value: 'asc', label: 'Mais antigos' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 flex items-center gap-4 animate-in slide-in-from-top-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
              <FontAwesomeIcon icon={faFilter} />
            </div>
            <div>
              <h3 className="font-bold text-rose-900">Ops! Ocorreu um erro</h3>
              <p className="text-rose-700">{error}</p>
              <button
                onClick={() => fetchPurchases()}
                className="mt-2 text-rose-800 font-semibold underline underline-offset-4 hover:text-rose-900"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Transactions Table/List */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden ring-1 ring-gray-200 transition-all">
          {sortedPurchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 ring-4 ring-gray-200/50">
                <FontAwesomeIcon icon={faShoppingBag} className="text-gray-300 text-3xl" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? 'Nenhum resultado encontrado' : 'Ainda não há transações'}
              </h3>
              <p className="text-gray-500 max-w-sm">
                {searchTerm
                  ? `Não encontramos nada para "${searchTerm}". Tente ajustar seus filtros.`
                  : 'Suas futuras compras e transações aparecerão aqui assim que você realizar seu primeiro pedido.'}
              </p>
              {searchTerm && (
                <Button variant="ghost" className="mt-4" onClick={() => setSearchTerm('')}>
                  Limpar busca
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50/50">
                      <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Produto & ID
                      </th>
                      <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Data
                      </th>
                      <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Valor total
                      </th>
                      <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status do pedido
                      </th>
                      <th scope="col" className="px-6 py-5 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedPurchases.map((purchase) => {
                      const status = statusMap(purchase.status);
                      return (
                        <tr key={purchase.id} className="hover:bg-gray-50/80 transition-colors group">
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                                {purchase.product?.imageUrl ? (
                                  <img
                                    src={purchase.product.imageUrl}
                                    alt={purchase.product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    <FontAwesomeIcon icon={faShoppingBag} />
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                  {purchase.product?.name || 'Produto indisponível'}
                                </div>
                                <div className="text-xs text-gray-400 font-mono">
                                  ID: {purchase.id.slice(0, 8)}...
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-600">
                              <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-gray-300" />
                              {new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <div className="text-sm font-black text-gray-900">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: purchase.currency || 'BRL' }).format(purchase.price)}
                            </div>
                            {purchase.paymentMethod && (
                              <div className="text-[10px] uppercase font-bold text-gray-400 mt-0.5">
                                via {purchase.paymentMethod}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap">
                            <Badge
                              variant={status.variant}
                              className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
                            >
                              {status.label}
                            </Badge>
                          </td>
                          <td className="px-6 py-5 whitespace-nowrap text-right">
                            <button className="p-2 rounded-lg hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-primary-600">
                              <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Section */}
              {totalPages > 1 && (
                <div className="px-6 py-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500 font-medium">
                    Mostrando <span className="text-gray-900">{startIndex + 1}</span> a <span className="text-gray-900">{Math.min(startIndex + pageSize, filteredPurchases.length)}</span> de <span className="text-gray-900">{filteredPurchases.length}</span> resultados
                  </p>
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
        </div>
      </div>
    </BuyerLayout>
  );
}
