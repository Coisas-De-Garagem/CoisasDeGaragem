import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBagShopping, faMagnifyingGlass, faBoxOpen, faMoneyBillWave } from '@fortawesome/free-solid-svg-icons';
import { PurchaseCard } from '@/components/buyer/PurchaseCard';
import { usePurchases } from '@/hooks/usePurchases';
import { DropdownSelect } from '@/components/common/DropdownSelect';
import { SearchInput } from '@/components/common/SearchInput';
import { Pagination } from '@/components/common/Pagination';
import { Card } from '@/components/common/Card';
import { Skeleton } from '@/components/common/Skeleton';
import { StatCard } from '@/components/common/StatCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { ProductImageGallery } from '@/components/common/ProductImageGallery';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
import { PageHeaderSkeleton, CardGridSkeleton } from '@/components/common/PageSkeletons';
import { formatProductCondition, getConditionVariant } from '@/utils/formatters';
import type { Purchase } from '@/types';

const currency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export default function PurchasesPage() {
  const { purchases, fetchPurchases } = usePurchases();
  const { addNotification } = useUIStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [category, setCategory] = useState<string>('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const pageSize = 9;

  const notify = useMemo(() => makeNotifier(addNotification), [addNotification]);

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.product?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = category === 'all' || purchase.product?.category === category;
    
    return matchesSearch && matchesCategory;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'date')
      comparison = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
    else if (sortBy === 'status') comparison = a.status.localeCompare(b.status);
    else if (sortBy === 'price') comparison = a.price - b.price;
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedPurchases.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPurchases = sortedPurchases.slice(startIndex, startIndex + pageSize);

  // Reset page when it goes out of bounds
  if (totalPages > 0 && currentPage > totalPages) {
    setCurrentPage(1);
  }

  useEffect(() => {
    let isMounted = true;
    fetchPurchases()
      .catch((err) => {
        if (!isMounted) return;
        const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar compras';
        setError(errorMsg);
        notify('error', 'Erro ao carregar compras', errorMsg);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fetchPurchases, notify]);

  const handleRetry = async () => {
    setIsLoading(true);
    setError('');
    try {
      await fetchPurchases();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar compras';
      setError(errorMsg);
      notify('error', 'Erro ao carregar compras', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-xl border border-border shadow-sm p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton height="h-3" width="w-24" />
                  <Skeleton height="h-6" width="w-16" />
                </div>
                <Skeleton variant="circular" width="w-10" height="h-10" />
              </div>
            </div>
          ))}
        </div>
        <Card flush>
          <div className="p-4 flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Skeleton height="h-10" rounded="rounded-md" />
            </div>
            <div className="flex gap-3">
              <Skeleton height="h-10" width="w-36" rounded="rounded-md" />
              <Skeleton height="h-10" width="w-32" rounded="rounded-md" />
            </div>
          </div>
        </Card>
        <CardGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-text-main">Minhas compras</h1>
          <p className="text-text-muted mt-1">
            Acompanhe suas compras realizadas nos garage sales
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Total de compras"
          value={sortedPurchases.length}
          tone="primary"
          icon={<FontAwesomeIcon icon={faBagShopping} />}
        />
        <StatCard
          label="Valor total"
          value={currency(sortedPurchases.reduce((sum, p) => sum + Number(p.price), 0))}
          tone="success"
          icon={<FontAwesomeIcon icon={faMoneyBillWave} />}
        />
        <StatCard
          label="Concluídas"
          value={
            sortedPurchases.filter((p) => (p.status || '').toUpperCase() === 'COMPLETED').length
          }
          tone="info"
          icon={<FontAwesomeIcon icon={faBoxOpen} />}
        />
      </div>

      {/* Filtros */}
      <Card flush overflowVisible className="relative z-40">
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por nome do produto, ID ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
            />
          </div>
          <div className="flex flex-wrap md:flex-nowrap gap-3">
            <div className="w-full md:w-56 z-30">
              <DropdownSelect
                value={category}
                onChange={(v) => setCategory(v)}
                options={[
                  { value: 'all', label: 'Todas Categorias' },
                  { value: 'Brinquedos', label: 'Brinquedos' },
                  { value: 'Eletrônicos', label: 'Eletrônicos' },
                  { value: 'Móveis', label: 'Móveis' },
                  { value: 'Roupas', label: 'Roupas' },
                  { value: 'Livros', label: 'Livros' },
                  { value: 'Esportes', label: 'Esportes' },
                  { value: 'Outros', label: 'Outros' },
                ]}
              />
            </div>
            <div className="w-full md:w-48 z-20">
              <DropdownSelect
                value={sortBy}
                onChange={(v) => setSortBy(v as 'date' | 'status' | 'price')}
                options={[
                  { value: 'date', label: 'Ordernar: Data' },
                  { value: 'status', label: 'Ordernar: Status' },
                  { value: 'price', label: 'Ordernar: Preço' },
                ]}
              />
            </div>
            <div className="w-full md:w-36 z-10">
              <DropdownSelect
                value={sortOrder}
                onChange={(v) => setSortOrder(v as 'asc' | 'desc')}
                options={[
                  { value: 'desc', label: 'Recente' },
                  { value: 'asc', label: 'Antigo' },
                ]}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Lista */}
      {error && purchases.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FontAwesomeIcon icon={faBoxOpen} />}
            title="Não foi possível carregar as compras"
            description={error}
            action={
              <Button variant="primary" onClick={handleRetry}>
                Tentar novamente
              </Button>
            }
          />
        </Card>
      ) : sortedPurchases.length === 0 && purchases.length > 0 ? (
        <Card>
          <EmptyState
            icon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
            title="Nenhuma compra encontrada"
            description="Tente buscar com outros termos."
          />
        </Card>
      ) : filteredPurchases.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FontAwesomeIcon icon={faBoxOpen} />}
            title="Você ainda não realizou compras"
            description="Escanee um QR code de um produto para fazer sua primeira compra."
            action={
              <Link to="/buyer/qr-scanner">
                <Button variant="primary" leftIcon={<FontAwesomeIcon icon={faBagShopping} />}>
                  Escanear QR code
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              totalItems={filteredPurchases.length}
            />
          )}
        </>
      )}

      {/* Modal de detalhes da compra com galeria clicável */}
      <Modal
        isOpen={Boolean(selectedPurchase)}
        onClose={() => setSelectedPurchase(null)}
        title={selectedPurchase?.product?.name || 'Detalhes da compra'}
        description={
          selectedPurchase
            ? `Pedido #${selectedPurchase.id.slice(-6)} · ${new Date(
                selectedPurchase.purchaseDate || selectedPurchase.createdAt,
              ).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}`
            : undefined
        }
        size="lg"
      >
        {selectedPurchase && (
          <div className="space-y-5">
            <ProductImageGallery
              images={selectedPurchase.product?.images}
              imageUrl={selectedPurchase.product?.imageUrl}
              alt={selectedPurchase.product?.name || 'Produto comprado'}
              aspectRatio="aspect-[4/3]"
              showThumbnails
              showIndicators
              allowFullscreen
            />

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-2xl font-bold text-text-main">
                  {currency(Number(selectedPurchase.price))}
                </p>
                <div className="flex items-center gap-2">
                  {selectedPurchase.product?.category && (
                    <Badge variant="info">{selectedPurchase.product.category}</Badge>
                  )}
                  {selectedPurchase.product?.condition && (
                    <Badge variant={getConditionVariant(selectedPurchase.product.condition)}>
                      {formatProductCondition(selectedPurchase.product.condition)}
                    </Badge>
                  )}
                </div>
              </div>

              {selectedPurchase.product?.description && (
                <p className="text-sm text-text-muted leading-relaxed">
                  {selectedPurchase.product.description}
                </p>
              )}

              <div className="rounded-xl bg-surface-sunken/60 border border-border p-3.5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs text-text-muted block">Vendedor</span>
                  <span className="font-medium text-text-main">
                    {selectedPurchase.seller?.name || 'Vendedor local'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-text-muted block">Pagamento</span>
                  <span className="font-medium text-text-main uppercase">
                    {selectedPurchase.paymentMethod || 'Não informado'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
