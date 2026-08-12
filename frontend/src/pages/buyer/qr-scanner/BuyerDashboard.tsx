import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faBagShopping,
  faLightbulb,
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import { QRScanner } from '@/components/buyer/QRScanner';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { Select } from '@/components/common/Select';
import type { Product, User } from '@/types';
import { api } from '@/services/api';
import { SearchInput } from '@/components/common/SearchInput';
import { ProductCard } from '@/components/seller/ProductCard';
import { CardGridSkeleton } from '@/components/common/PageSkeletons';
import { EmptyState } from '@/components/common/EmptyState';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { formatProductCondition, getConditionVariant } from '@/utils/formatters';

const currency = (value: number, curr = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: curr }).format(value);

export default function BuyerDashboard() {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [sellerInfo, setSellerInfo] = useState<User | null>(null);

  // Estados de Exploração
  const [searchStr, setSearchStr] = useState('');
  const [debouncedSearchStr, setDebouncedSearchStr] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [exploreProducts, setExploreProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Debounce da busca
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchStr(searchStr);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchStr]);

  // Fetch de produtos
  useEffect(() => {
    async function fetchExplore() {
      setIsLoadingProducts(true);
      try {
        const result = await api.getProducts({
          search: debouncedSearchStr || undefined,
          category: category || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        });
        if (result.success) {
          const fetched = Array.isArray(result.data) ? result.data : (result.data?.products || []);
          setExploreProducts(fetched);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingProducts(false);
      }
    }
    fetchExplore();
  }, [debouncedSearchStr, category, minPrice, maxPrice]);

  const handleCloseModal = () => {
    setScannedProduct(null);
  };

  const handleScanSuccess = (product: Product, seller: User) => {
    setScannedProduct(product);
    setSellerInfo(seller);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main">Explorar garage sales</h1>
        <p className="text-text-muted mt-1">
          Escaneie o QR code de um produto para ver detalhes e comprar.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Scanner */}
        <Card className="lg:col-span-3">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-main flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 text-primary [&_svg]:w-5 [&_svg]:h-5">
                <FontAwesomeIcon icon={faQrcode} />
              </span>
              Escanear QR code
            </h2>
          </div>
          <div className="p-4 sm:p-5">
            <QRScanner onScanSuccess={handleScanSuccess} />
          </div>
        </Card>

        {/* Como começar */}
        <Card className="lg:col-span-2">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-base font-semibold text-text-main flex items-center gap-2">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent/15 text-accent-600 dark:text-accent-300 [&_svg]:w-5 [&_svg]:h-5">
                <FontAwesomeIcon icon={faLightbulb} />
              </span>
              Como funciona
            </h2>
          </div>
          <ol className="p-5 space-y-4">
            {[
              { n: 1, title: 'Escanear', text: 'Aponte a câmera para o QR code do produto.' },
              { n: 2, title: 'Conferir', text: 'Veja detalhes, preço e condição do item.' },
              { n: 3, title: 'Pagar', text: 'Escolha o pagamento (PIX, cartão ou dinheiro).' },
            ].map((step) => (
              <li key={step.n} className="flex items-start gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-sm font-bold">
                  {step.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-text-main">{step.title}</p>
                  <p className="text-sm text-text-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {/* Grade de Exploração de Produtos */}
      <div className="pt-8 mt-8 border-t border-border space-y-6">
        <div>
          <h2 className="text-xl font-bold text-text-main">Todos os produtos disponíveis</h2>
          <p className="text-sm text-text-muted mt-1">Busque, filtre e explore itens à venda.</p>
        </div>

        {/* Filtros */}
        <Card flush>
          <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <SearchInput
                placeholder="Buscar produtos..."
                value={searchStr}
                onChange={(e) => setSearchStr(e.target.value)}
                onClear={() => setSearchStr('')}
              />
            </div>
            <div>
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: '', label: 'Todas categorias' },
                  { value: 'Eletrônicos', label: 'Eletrônicos' },
                  { value: 'Móveis', label: 'Móveis' },
                  { value: 'Roupas', label: 'Roupas' },
                  { value: 'Livros', label: 'Livros' },
                  { value: 'Outros', label: 'Outros' },
                ]}
                aria-label="Categoria"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min R$"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-text-main placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <input
                type="number"
                placeholder="Max R$"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-surface border border-border-strong rounded-lg px-3 py-2 text-sm text-text-main placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Lista de Produtos */}
        {isLoadingProducts ? (
          <CardGridSkeleton count={6} />
        ) : exploreProducts.length === 0 ? (
          <Card>
            <EmptyState
              icon={<FontAwesomeIcon icon={faBoxOpen} />}
              title="Nenhum produto encontrado"
              description="Não encontramos resultados para a sua busca ou filtros."
              action={
                <Button variant="outline" onClick={() => { setSearchStr(''); setCategory(''); setMinPrice(''); setMaxPrice(''); }}>
                  Limpar filtros
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {exploreProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showActions={false}
                onClick={(prod) => {
                  setScannedProduct(prod);
                  setSellerInfo(prod.seller as any || null);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal: detalhes do produto */}
      <Modal
        isOpen={!!scannedProduct}
        onClose={handleCloseModal}
        title="Detalhes do Produto"
        size="md"
      >
        {scannedProduct && (
          <div className="space-y-5">
            {/* Imagem */}
            <div className="aspect-video bg-surface-sunken rounded-lg overflow-hidden">
              {scannedProduct.imageUrl ? (
                <img src={scannedProduct.imageUrl} alt={scannedProduct.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-subtle">
                  <FontAwesomeIcon icon={faBagShopping} className="w-10 h-10" />
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-start gap-3 mb-1">
                <h3 className="text-xl font-bold text-text-main">{scannedProduct.name}</h3>
                <div className="text-xl font-bold text-text-main whitespace-nowrap">
                  {currency(scannedProduct.price, scannedProduct.currency)}
                </div>
              </div>
              <p className="text-text-muted text-sm">{scannedProduct.description}</p>
            </div>

            {/* Condição, Vendedor e Local */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-surface-sunken/60 p-3 rounded-lg text-center">
                <div className="text-xs text-text-subtle uppercase font-semibold mb-1.5">Condição</div>
                <Badge variant={getConditionVariant(scannedProduct.condition)}>
                  {formatProductCondition(scannedProduct.condition)}
                </Badge>
              </div>
              <div className="bg-surface-sunken/60 p-3 rounded-lg text-center">
                <div className="text-xs text-text-subtle uppercase font-semibold mb-1.5">Vendedor</div>
                <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-text-main">
                  <FontAwesomeIcon icon={faStore} className="w-4 h-4 text-primary" />
                  {sellerInfo?.name || 'Vendedor'}
                </div>
              </div>
              
              {scannedProduct.location && (
                <div className="bg-surface-sunken/60 p-3 rounded-lg text-center col-span-2">
                  <div className="text-xs text-text-subtle uppercase font-semibold mb-1.5">Local</div>
                  <div className="text-sm font-medium text-text-main">
                    {scannedProduct.location.name}
                  </div>
                  <div className="text-xs text-text-subtle mt-0.5">
                    {scannedProduct.location.address}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <Button variant="ghost" onClick={handleCloseModal} className="flex-1">
                Fechar Detalhes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
