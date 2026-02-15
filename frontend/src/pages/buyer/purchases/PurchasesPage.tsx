import { BuyerLayout } from '@/components/buyer/BuyerLayout';
import { PurchaseCard } from '@/components/buyer/PurchaseCard';
import { usePurchases } from '@/hooks/usePurchases';
import { Spinner } from '@/components/common/Spinner';

import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Pagination } from '@/components/common/Pagination';
import { useState, useEffect } from 'react';
import type { Purchase } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBox, faShoppingBag } from '@fortawesome/free-solid-svg-icons';

export default function PurchasesPage() {
  const { purchases, fetchPurchases } = usePurchases();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 9;

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter(purchase =>
    purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered purchases
  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'date') {
      comparison = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
    } else if (sortBy === 'status') {
      comparison = a.status.localeCompare(b.status);
    } else if (sortBy === 'price') {
      comparison = a.price - b.price;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Paginate sorted purchases
  const totalPages = Math.ceil(sortedPurchases.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPurchases = sortedPurchases.slice(startIndex, startIndex + pageSize);

  // Reset to page 1 when search term or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  // Load purchases on mount
  useEffect(() => {
    const loadPurchases = async () => {
      setIsLoading(true);
      setError('');
      try {
        await fetchPurchases();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar compras');
      } finally {
        setIsLoading(false);
      }
    };
    loadPurchases();
  }, [fetchPurchases]);

  const handleViewDetails = (purchase: Purchase) => {
    // setSelectedPurchase(purchase);
    console.log('View details for order:', purchase.id);
  };

  if (isLoading) {
    return (
      <BuyerLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">Carregando compras...</p>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  if (error) {
    return (
      <BuyerLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-2">Erro ao carregar compras</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={(e) => {
                e.preventDefault();
                fetchPurchases();
              }}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Minhas Compras
            </h1>
            <p className="text-gray-600">
              Acompanhe suas compras realizadas nos garage sales
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="search"
              placeholder="Buscar compras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-[200px]"
            />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'status' | 'price')}
              className="min-w-[150px]"
              options={[
                { value: 'date', label: 'Data' },
                { value: 'status', label: 'Status' },
                { value: 'price', label: 'Preço' },
              ]}
            />
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="min-w-[120px]"
              options={[
                { value: 'asc', label: 'Antigo' },
                { value: 'desc', label: 'Recente' },
              ]}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total de Compras</p>
            <p className="text-3xl font-bold text-primary">{sortedPurchases.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Valor Total</p>
            <p className="text-3xl font-bold text-green-600">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(
                sortedPurchases.reduce((sum, p) => sum + p.price, 0)
              )}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Compras Concluídas</p>
            <p className="text-3xl font-bold text-blue-600">
              {sortedPurchases.filter(p => p.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Purchases List */}
        {sortedPurchases.length === 0 && purchases.length > 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faSearch} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma compra encontrada
            </h3>
            <p className="text-gray-600">
              Tente buscar com outros termos
            </p>
          </div>
        ) : filteredPurchases.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faBox} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma compra encontrada
            </h3>
            <p className="text-gray-600 mb-6">
              Você ainda não realizou nenhuma compra.
            </p>
            <button
              onClick={() => window.location.href = '/buyer/qr-scanner'}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              <FontAwesomeIcon icon={faShoppingBag} className="mr-2" /> Escanear QR Code
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              totalItems={filteredPurchases.length}
            />
          </div>
        )}
      </div>
    </BuyerLayout>
  );
}
