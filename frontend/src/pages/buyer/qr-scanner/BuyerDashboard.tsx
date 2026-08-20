import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQrcode,
  faLightbulb,
  faStore,
  faBoxOpen,
  faCircleCheck,
  faCreditCard,
  faClock,
  faCopy,
  faCheck,
  faXmark,
  faBagShopping,
} from '@fortawesome/free-solid-svg-icons';
import { QRScanner } from '@/components/buyer/QRScanner';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Card } from '@/components/common/Card';
import { Select } from '@/components/common/Select';
import { Alert } from '@/components/common/Alert';
import { Spinner } from '@/components/common/Spinner';
import { ProductImageGallery } from '@/components/common/ProductImageGallery';
import type { Product, User, PaymentMethod } from '@/types';
import { api } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { SearchInput } from '@/components/common/SearchInput';
import { ProductCard } from '@/components/seller/ProductCard';
import { CardGridSkeleton } from '@/components/common/PageSkeletons';
import { EmptyState } from '@/components/common/EmptyState';
import { formatProductCondition, getConditionVariant } from '@/utils/formatters';

const currency = (value: number, curr = 'BRL') =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: curr }).format(value);

export default function BuyerDashboard() {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [sellerInfo, setSellerInfo] = useState<User | null>(null);
  const [isScannedViaQR, setIsScannedViaQR] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const { addNotification } = useUIStore();

  const [checkoutData, setCheckoutData] = useState<{
    purchaseId: string;
    paymentMethod: string;
    qrCode?: string;
    pixKey?: string;
    chargeId?: string;
    paymentUrl?: string;
    expiresInSeconds: number;
    price: number;
    currency: string;
    productName: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [showTimeoutAlert, setShowTimeoutAlert] = useState<boolean>(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

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

  // Fetch de produtos do catálogo
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

  const handleCheckoutTimeout = () => {
    setCheckoutData(null);
    setScannedProduct(null);
    setIsScannedViaQR(false);
    setShowTimeoutAlert(true);
    addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Tempo expirado',
      message: 'O tempo limite para pagamento expirou e o produto está disponível novamente.',
      createdAt: new Date().toISOString(),
      userId: '',
      isRead: false,
    });
  };

  const handleSimulatePayment = async () => {
    if (!checkoutData?.chargeId) return;
    setIsSimulating(true);
    try {
      const result = await api.simulatePayment(checkoutData.chargeId, checkoutData.purchaseId);
      if (result.success) {
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Simulação enviada',
          message: 'Simulação de pagamento enviada! Aguarde a confirmação.',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false,
        });
      } else {
        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Erro de simulação',
          message: result.error?.message || 'Falha ao simular pagamento.',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false,
        });
      }
    } catch {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro ao simular o pagamento.',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCloseModal = () => {
    setCheckoutData(null);
    setScannedProduct(null);
    setIsScannedViaQR(false);
    setPurchaseSuccess(false);
  };

  // Poll de status + countdown quando o checkout está ativo.
  useEffect(() => {
    if (!checkoutData) return;
    if (checkoutData.paymentMethod === 'CARD') setIframeLoading(true);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleCheckoutTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    let isSubscribed = true;
    const pollInterval = setInterval(async () => {
      try {
        const result = await api.getPurchase(checkoutData.purchaseId);
        if (!isSubscribed) return;
        if (result.success && result.data) {
          const status = (result.data.status as string).toUpperCase();
          if (status === 'COMPLETED' || status === 'APPROVED') {
            clearInterval(timer);
            clearInterval(pollInterval);
            setCheckoutData(null);
            setPurchaseSuccess(true);
            addNotification({
              id: Date.now().toString(),
              type: 'success',
              title: 'Sucesso',
              message: 'Pagamento confirmado! Compra realizada com sucesso.',
              createdAt: new Date().toISOString(),
              userId: '',
              isRead: false,
            });
          } else if (status === 'CANCELLED' || status === 'FAILED') {
            clearInterval(timer);
            clearInterval(pollInterval);
            handleCheckoutTimeout();
          }
        }
      } catch (err) {
        console.error('Error polling purchase status:', err);
      }
    }, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(timer);
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutData]);

  // Quando o produto é escaneado via câmera QR Code (Habilita arremate!)
  const handleScanSuccess = (product: Product, seller: User) => {
    setScannedProduct(product);
    setSellerInfo(seller);
    setIsScannedViaQR(true);
    setPurchaseSuccess(false);
    setCheckoutData(null);
  };

  // Quando o produto é clicado da lista de exploração (Apenas visualização!)
  const handleExploreProductClick = (product: Product) => {
    setScannedProduct(product);
    setSellerInfo(product.seller || null);
    setIsScannedViaQR(false);
    setPurchaseSuccess(false);
    setCheckoutData(null);
  };

  const handleBuy = async () => {
    if (!scannedProduct || !isScannedViaQR) return;
    setIsBuying(true);
    try {
      const result = await api.createPurchase({
        productId: scannedProduct.id,
        qrCode: scannedProduct.qrCode,
        paymentMethod,
      });

      if (result.success) {
        if (paymentMethod === 'pix' || paymentMethod === 'card') {
          setCheckoutData({
            purchaseId: result.data.id,
            paymentMethod: paymentMethod.toUpperCase(),
            qrCode: result.data.qrCode,
            pixKey: result.data.pixKey,
            chargeId: result.data.chargeId,
            paymentUrl: result.data.paymentUrl,
            expiresInSeconds: result.data.expiresInSeconds || 60,
            price: scannedProduct.price,
            currency: scannedProduct.currency,
            productName: scannedProduct.name,
          });
          setTimeLeft(result.data.expiresInSeconds || 60);
          return;
        }
        setPurchaseSuccess(true);
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Sucesso',
          message: 'Compra realizada com sucesso!',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false,
        });
      } else {
        const errorMsg = result.error?.message || '';
        let translatedMsg = errorMsg;
        if (errorMsg.includes('paymentMethod')) translatedMsg = 'Método de pagamento inválido ou faltando.';
        else if (errorMsg.toLowerCase().includes('product not found')) translatedMsg = 'Produto não encontrado.';
        else if (errorMsg.toLowerCase().includes('not available')) translatedMsg = 'Este produto não está mais disponível.';
        else if (errorMsg.toLowerCase().includes('own product')) translatedMsg = 'Você não pode comprar seu próprio produto.';

        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Atenção',
          message: translatedMsg || 'Erro ao realizar a compra.',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false,
        });
      }
    } catch {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao realizar a compra.',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false,
      });
    } finally {
      setIsBuying(false);
    }
  };

  const paymentOptions = [
    { value: 'pix', label: 'PIX (Instantâneo)' },
    { value: 'card', label: 'Cartão de Crédito / Débito' },
    { value: 'cash', label: 'Dinheiro (No local)' },
    { value: 'other', label: 'Outro' },
  ];

  const isSold = scannedProduct?.isSold;
  const isReserved = scannedProduct?.isReserved;
  const isAvailable = Boolean(scannedProduct?.isAvailable && !isReserved && !isSold);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main">Explorar garage sales</h1>
        <p className="text-text-muted mt-1">
          Escaneie o QR code de um produto no local do evento para arrematar.
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
              { n: 1, title: 'Escanear no local', text: 'Aponte a câmera para o QR code físico do produto.' },
              { n: 2, title: 'Conferir detalhes', text: 'Veja fotos, preço e condição do item.' },
              { n: 3, title: 'Arrematar', text: 'Escolha o pagamento (PIX, cartão ou dinheiro) e confirme.' },
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
          <p className="text-sm text-text-muted mt-1">Busque, filtre e confira os itens antes de ir ao evento.</p>
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
                onClick={handleExploreProductClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal: detalhes / arremate / checkout */}
      <Modal
        isOpen={!!scannedProduct}
        onClose={handleCloseModal}
        title={
          purchaseSuccess
            ? 'Compra realizada!'
            : checkoutData
              ? 'Finalizar pagamento'
              : isScannedViaQR
                ? 'Arrematar Produto'
                : 'Detalhes do Produto'
        }
        size={checkoutData ? 'xl' : 'md'}
      >
        {scannedProduct && (
          <div className="space-y-5">
            {/* SUCESSO */}
            {purchaseSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto mb-4 [&_svg]:w-8 [&_svg]:h-8">
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-1">Produto Arrematado!</h3>
                <p className="text-text-muted">
                  Você comprou <strong>{scannedProduct.name}</strong> com sucesso.
                </p>
                <Button variant="primary" onClick={handleCloseModal} fullWidth className="mt-6">
                  Concluir
                </Button>
              </div>
            ) : checkoutData ? (
              /* FLUXO DE CHECKOUT ATIVO (APENAS APÓS ESCANEAR QR) */
              <div className="space-y-5">
                {/* Timer */}
                <div className="bg-warning-soft/60 border border-warning/40 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <FontAwesomeIcon icon={faClock} className="w-5 h-5 text-amber-600 animate-pulse" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Aguardando pagamento</p>
                      <p className="text-xs text-amber-700 dark:text-amber-400">Pague antes que o tempo expire.</p>
                    </div>
                  </div>
                  <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 px-3 py-1.5 rounded-md font-mono font-bold text-lg tabular-nums">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                {/* Resumo do item */}
                <div className="bg-surface-sunken/60 rounded-lg p-4 flex justify-between items-center">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-text-main truncate">{checkoutData.productName}</h4>
                    <p className="text-xs text-text-muted">Valor do item</p>
                  </div>
                  <div className="text-lg font-bold text-text-main">
                    {currency(checkoutData.price, checkoutData.currency)}
                  </div>
                </div>

                {/* PIX */}
                {checkoutData.paymentMethod === 'PIX' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center p-4 bg-surface border border-border rounded-lg">
                      {checkoutData.qrCode ? (
                        <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-2 border border-border shadow-sm">
                          <img src={checkoutData.qrCode} alt="PIX QR Code" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-48 h-48 bg-surface-sunken rounded-lg flex items-center justify-center text-primary">
                          <Spinner size="lg" />
                        </div>
                      )}
                      <p className="text-sm font-medium text-text-main mt-3">Escaneie o QR code PIX com o app do seu banco</p>
                    </div>

                    {/* Copia e cola */}
                    {checkoutData.pixKey && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                          Código PIX copia e cola
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={checkoutData.pixKey}
                            className="flex-1 bg-surface border border-border-strong rounded-lg px-3 py-2.5 text-sm font-mono text-text-muted truncate"
                          />
                          <Button
                            variant={copied ? 'success' : 'outline'}
                            onClick={() => {
                              if (checkoutData.pixKey) {
                                navigator.clipboard.writeText(checkoutData.pixKey);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 2000);
                              }
                            }}
                            leftIcon={<FontAwesomeIcon icon={copied ? faCheck : faCopy} />}
                          >
                            {copied ? 'Copiado' : 'Copiar'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {checkoutData.chargeId && (
                      <div className="pt-3 border-t border-dashed border-border">
                        <Button
                          variant="accent"
                          fullWidth
                          onClick={handleSimulatePayment}
                          isLoading={isSimulating}
                          leftIcon={<FontAwesomeIcon icon={isSimulating ? faClock : faCheck} className={isSimulating ? 'animate-spin' : ''} />}
                        >
                          {isSimulating ? 'Simulando aprovação...' : 'Simular pagamento (dev)'}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* CARTÃO */}
                {checkoutData.paymentMethod === 'CARD' && (
                  <div className="space-y-3">
                    <div className="bg-surface-sunken rounded-lg overflow-hidden border border-border h-[460px] relative flex items-center justify-center">
                      {iframeLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-sunken z-10 text-primary">
                          <Spinner size="lg" />
                          <span className="text-sm text-text-muted mt-2">Carregando portal de pagamento...</span>
                        </div>
                      )}
                      <iframe
                        src={checkoutData.paymentUrl}
                        className="w-full h-full border-none"
                        title="Pagamento Cartão"
                        allow="payment"
                        onLoad={() => setIframeLoading(false)}
                      />
                    </div>
                    {checkoutData.paymentUrl && (
                      <div className="text-center">
                        <a
                          href={checkoutData.paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Problemas com a visualização? Abra em uma nova aba
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <Button variant="ghost" fullWidth onClick={handleCloseModal}>
                  Voltar para detalhes
                </Button>
              </div>
            ) : (
              /* DETALHES DO PRODUTO */
              <>
                {/* Galeria de Fotos */}
                <ProductImageGallery
                  images={scannedProduct.images}
                  imageUrl={scannedProduct.imageUrl}
                  alt={scannedProduct.name}
                  aspectRatio="aspect-video"
                  showThumbnails={true}
                  showIndicators={true}
                  allowFullscreen={true}
                />

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

                {/* MODO ESCANEADO VIA QR CODE: Permite escolher pagamento e arrematar */}
                {isScannedViaQR ? (
                  <>
                    {isAvailable ? (
                      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                          <FontAwesomeIcon icon={faCreditCard} className="w-4 h-4" />
                          <h4 className="font-semibold text-sm">Forma de pagamento</h4>
                        </div>
                        <Select
                          options={paymentOptions}
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                          aria-label="Método de pagamento"
                        />
                        <p className="text-xs text-text-muted">
                          Com PIX ou Cartão você conclui na hora pelo app. Para Dinheiro, pague diretamente ao vendedor no local.
                        </p>
                      </div>
                    ) : isSold ? (
                      <Alert variant="info" title="Produto Vendido">
                        Este item já encontrou um novo dono e não está mais disponível.
                      </Alert>
                    ) : isReserved ? (
                      <Alert variant="warning" title="Produto Reservado">
                        Outro comprador já iniciou o processo de reserva deste produto.
                      </Alert>
                    ) : (
                      <Alert variant="warning" title="Indisponível">
                        Este item não está disponível para arremate no momento.
                      </Alert>
                    )}

                    {/* Ações para produto escaneado */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="ghost" onClick={handleCloseModal} className="flex-1">
                        Cancelar
                      </Button>
                      {isAvailable && (
                        <Button
                          variant="primary"
                          onClick={handleBuy}
                          isLoading={isBuying}
                          leftIcon={<FontAwesomeIcon icon={faBagShopping} />}
                          className="flex-[2]"
                        >
                          Arrematar produto
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  /* MODO APENAS EXPLORAÇÃO (NÃO ESCANEADO): Informativo de como arrematar no local */
                  <>
                    <div className="bg-surface-sunken/60 border border-border rounded-lg p-3.5 flex items-start gap-3 text-sm">
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                        <FontAwesomeIcon icon={faQrcode} className="w-4 h-4" />
                      </span>
                      <div>
                        <p className="font-semibold text-text-main">Como arrematar este item?</p>
                        <p className="text-text-muted text-xs mt-0.5">
                          Para comprar este produto, compareça ao garage sale e aponte a câmera do scanner para o QR code físico afixado no item.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Button variant="ghost" onClick={handleCloseModal} fullWidth>
                        Fechar Detalhes
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Modal: Timeout */}
      <Modal
        isOpen={showTimeoutAlert}
        onClose={() => setShowTimeoutAlert(false)}
        title="Tempo limite expirado"
        size="sm"
        footer={
          <Button variant="primary" onClick={() => setShowTimeoutAlert(false)} fullWidth>
            Entendi
          </Button>
        }
      >
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto mb-4 [&_svg]:w-7 [&_svg]:h-7">
            <FontAwesomeIcon icon={faXmark} />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-1">Tempo limite expirado</h3>
          <p className="text-text-muted text-sm">
            O tempo para pagamento expirou. O produto voltou ao catálogo e está disponível para outros compradores.
          </p>
        </div>
      </Modal>
    </div>
  );
}
