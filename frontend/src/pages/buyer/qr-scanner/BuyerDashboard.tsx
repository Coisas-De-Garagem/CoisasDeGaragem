import { BuyerLayout } from '@/components/buyer/BuyerLayout';
import { QRScanner } from '@/components/buyer/QRScanner';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Select } from '@/components/common/Select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faShoppingBag, faLightbulb, faStore, faCheckCircle, faCreditCard, faClock, faCopy, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';

import { useState, useEffect } from 'react';
import type { Product, User, PaymentMethod } from '@/types';
import { api } from '@/services/api';
import { useUIStore } from '@/store/uiStore';
import { formatProductCondition, getConditionVariant } from '@/utils/formatters';

export default function BuyerDashboard() {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [sellerInfo, setSellerInfo] = useState<User | null>(null);
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

  const handleCheckoutTimeout = () => {
    setCheckoutData(null);
    setScannedProduct(null);
    setShowTimeoutAlert(true);
    addNotification({
      id: Date.now().toString(),
      type: 'error',
      title: 'Tempo Expirado',
      message: 'O tempo limite para pagamento expirou e o produto está disponível novamente.',
      createdAt: new Date().toISOString(),
      userId: '',
      isRead: false
    });
  };

  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulatePayment = async () => {
    if (!checkoutData?.chargeId) return;

    setIsSimulating(true);
    try {
      const result = await api.simulatePayment(checkoutData.chargeId, checkoutData.purchaseId);
      if (result.success) {
        addNotification({
          id: Date.now().toString(),
          type: 'success',
          title: 'Simulação Enviada',
          message: 'Simulação de pagamento enviada com sucesso! Aguarde a confirmação.',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false
        });
      } else {
        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Erro de Simulação',
          message: result.error?.message || 'Falha ao simular pagamento.',
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false
        });
      }
    } catch (err) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro ao simular o pagamento.',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleCloseModal = () => {
    setCheckoutData(null);
    setScannedProduct(null);
    setPurchaseSuccess(false);
  };

  // Poll purchase status and countdown timer when checkout is active
  useEffect(() => {
    if (!checkoutData) return;

    if (checkoutData.paymentMethod === 'CARD') {
      setIframeLoading(true);
    }

    // Set up countdown
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

    // Set up status polling
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
              isRead: false
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
  }, [checkoutData]);

  const handleScanSuccess = (product: Product, seller: User) => {
    setScannedProduct(product);
    setSellerInfo(seller);
    setPurchaseSuccess(false);
  };

  const handleBuy = async () => {
    if (!scannedProduct) return;

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
          isRead: false
        });
      } else {
        const errorMsg = result.error?.message || '';
        let translatedMsg = errorMsg;

        if (errorMsg.includes('paymentMethod')) {
          translatedMsg = 'Método de pagamento inválido ou faltando.';
        } else if (errorMsg.toLowerCase().includes('product not found')) {
          translatedMsg = 'Produto não encontrado.';
        } else if (errorMsg.toLowerCase().includes('not available')) {
          translatedMsg = 'Este produto não está mais disponível.';
        } else if (errorMsg.toLowerCase().includes('own product')) {
          translatedMsg = 'Você não pode comprar seu próprio produto! Tente com um produto de outro vendedor.';
        }

        addNotification({
          id: Date.now().toString(),
          type: 'error',
          title: 'Atenção',
          message: translatedMsg,
          createdAt: new Date().toISOString(),
          userId: '',
          isRead: false
        });
      }
    } catch (err) {
      addNotification({
        id: Date.now().toString(),
        type: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro inesperado ao realizar a compra.',
        createdAt: new Date().toISOString(),
        userId: '',
        isRead: false
      });
    } finally {
      setIsBuying(false);
    }
  };

  const paymentOptions = [
    { value: 'pix', label: 'PIX' },
    { value: 'cash', label: 'Dinheiro' },
    { value: 'card', label: 'Cartão' },
    { value: 'other', label: 'Outro' },
  ];

  return (
    <BuyerLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center lg:text-left">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
            Painel do Comprador
          </h1>
          <p className="text-lg text-gray-500">
            Gerencie suas aquisições e explore novas ofertas
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* QR Scanner Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <FontAwesomeIcon icon={faQrcode} className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Escanear QR Code
              </h2>
            </div>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Encontrou algo interessante? Escaneie o código do produto para ver detalhes e finalizar a compra instantaneamente.
            </p>
            <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200 min-h-[300px] flex items-center justify-center">
              <QRScanner onScanSuccess={handleScanSuccess} />
            </div>
          </div>

          {/* Recent Purchases Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-xl transition-all duration-300 flex flex-col">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                <FontAwesomeIcon icon={faShoppingBag} className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Minhas Compras
              </h2>
            </div>
            <p className="text-gray-600 mb-6">
              Visualize suas compras recentes e acompanhe o status dos seus pedidos.
            </p>

            <div className="flex-1 flex flex-col items-center justify-center py-8 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <FontAwesomeIcon icon={faShoppingBag} className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma compra recente
              </h3>
              <p className="text-gray-500 mb-6 text-center max-w-xs px-4">
                Você ainda não realizou nenhuma compra. Que tal começar agora?
              </p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20"
              >
                Escanear Agora
              </button>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 hover:shadow-lg transition-shadow duration-300">
          <h2 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-2">
            <FontAwesomeIcon icon={faLightbulb} className="text-warning" />
            Como Começar
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-0.5 bg-neutral-100 -z-10"></div>

            <div className="relative flex flex-col items-center text-center gap-4 z-10">
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary flex items-center justify-center font-bold text-lg border-4 border-white shadow-sm ring-1 ring-primary/10">
                1
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 mb-2">
                  Escanear QR Code
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-[250px] mx-auto">
                  Aponte a câmera do celular para o código do produto que você gostou no garage sale.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col items-center text-center gap-4 z-10">
              <div className="w-12 h-12 rounded-full bg-secondary-50 text-secondary flex items-center justify-center font-bold text-lg border-4 border-white shadow-sm ring-1 ring-secondary/10">
                2
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 mb-2">
                  Ver Minhas Compras
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-[250px] mx-auto">
                  Acesse seu histórico completo e detalhes de cada item adquirido.
                </p>
              </div>
            </div>

            <div className="relative flex flex-col items-center text-center gap-4 z-10">
              <div className="w-12 h-12 rounded-full bg-success/10 text-success flex items-center justify-center font-bold text-lg border-4 border-white shadow-sm ring-1 ring-success/20">
                3
              </div>
              <div>
                <h3 className="font-bold text-neutral-800 mb-2">
                  Configurar Perfil
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed max-w-[250px] mx-auto">
                  Mantenha seus dados atualizados para facilitar o contato com vendedores.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail / Checkout Modal */}
      <Modal
        isOpen={!!scannedProduct}
        onClose={handleCloseModal}
        title={
          purchaseSuccess
            ? "Compra Realizada!"
            : checkoutData
            ? "Finalizar Pagamento"
            : "Detalhes do Produto"
        }
        size={checkoutData ? "xl" : "md"}
      >
        {scannedProduct && (
          <div className="space-y-6">
            {purchaseSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-4xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sucesso!</h3>
                <p className="text-gray-600">
                  Você comprou <strong>{scannedProduct.name}</strong> com sucesso.
                </p>
                <div className="mt-8">
                  <Button variant="primary" onClick={handleCloseModal} className="w-full">
                    Fechar
                  </Button>
                </div>
              </div>
            ) : checkoutData ? (
              <div className="space-y-6">
                {/* Timer Header */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3 text-amber-850">
                    <FontAwesomeIcon icon={faClock} className="text-xl text-amber-600 animate-pulse" />
                    <div>
                      <h4 className="font-bold text-sm text-amber-900">Aguardando pagamento...</h4>
                      <p className="text-xs text-amber-700">Realize o pagamento antes que o tempo expire.</p>
                    </div>
                  </div>
                  <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl font-mono font-bold text-lg flex items-center gap-1.5 shadow-sm">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>

                {/* Product Detail Brief */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex justify-between items-center shadow-inner">
                  <div>
                    <h4 className="font-bold text-gray-900">{checkoutData.productName}</h4>
                    <p className="text-xs text-gray-500">Valor do item</p>
                  </div>
                  <div className="text-xl font-black text-blue-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: checkoutData.currency,
                    }).format(checkoutData.price)}
                  </div>
                </div>

                {/* PIX Payment Method UI */}
                {checkoutData.paymentMethod === 'PIX' && (
                  <div className="space-y-6">
                    {/* QR Code Container */}
                    <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-100 rounded-2xl shadow-sm">
                      {checkoutData.qrCode ? (
                        <div className="w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden border border-gray-200 p-2 shadow-inner">
                          <img
                            src={checkoutData.qrCode}
                            alt="PIX QR Code"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center border border-dashed border-gray-300">
                          <FontAwesomeIcon icon={faClock} className="text-gray-400 text-3xl animate-spin" />
                        </div>
                      )}
                      <p className="text-sm font-semibold text-gray-700 mt-4 text-center">
                        Escaneie o QR Code Pix acima
                      </p>
                    </div>

                    {/* Copy Paste Key */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                        Código Pix Copia e Cola
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value={checkoutData.pixKey || ''}
                          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono text-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 truncate"
                        />
                        <button
                          onClick={() => {
                            if (checkoutData.pixKey) {
                              navigator.clipboard.writeText(checkoutData.pixKey);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }
                          }}
                          className={`px-4 py-3 rounded-xl font-bold flex items-center gap-2 border transition-all ${
                            copied
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                          }`}
                        >
                          <FontAwesomeIcon icon={copied ? faCheck : faCopy} />
                          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                    {checkoutData.chargeId && (
                      <div className="pt-4 border-t border-dashed border-gray-100">
                        <button
                          onClick={handleSimulatePayment}
                          disabled={isSimulating}
                          className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold rounded-xl text-center shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <FontAwesomeIcon icon={isSimulating ? faClock : faCheckCircle} className={isSimulating ? 'animate-spin' : ''} />
                          {isSimulating ? 'Simulando aprovação...' : 'Simular Pagamento (Dev Mode)'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* CARD Payment Method UI */}
                {checkoutData.paymentMethod === 'CARD' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 h-[500px] shadow-inner relative flex items-center justify-center">
                      {iframeLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-semibold text-gray-500">Carregando portal de pagamento...</span>
                          </div>
                        </div>
                      )}
                      <iframe
                        src={checkoutData.paymentUrl}
                        className="w-full h-full border-none"
                        title="Pagamento Abacate Pay"
                        allow="payment"
                        onLoad={() => setIframeLoading(false)}
                      />
                    </div>
                    <div className="text-center">
                      <a
                        href={checkoutData.paymentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                      >
                        Problemas com a tela? Clique aqui para abrir em uma nova aba
                      </a>
                    </div>
                  </div>
                )}

                {/* Return Button */}
                <div className="pt-2">
                  <button
                    onClick={handleCloseModal}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-center transition-colors"
                  >
                    Voltar para Detalhes
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                  {scannedProduct.imageUrl ? (
                    <img src={scannedProduct.imageUrl} alt={scannedProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <FontAwesomeIcon icon={faShoppingBag} className="text-5xl" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{scannedProduct.name}</h3>
                    <div className="text-2xl font-black text-blue-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: scannedProduct.currency,
                      }).format(scannedProduct.price)}
                    </div>
                  </div>
                  <p className="text-gray-600">{scannedProduct.description}</p>
                </div>

                <div className="bg-[#4169E1]/5 p-6 rounded-2xl border-2 border-[#4169E1]/20 shadow-inner">
                  <div className="flex items-center gap-3 mb-4 text-[#4169E1]">
                    <FontAwesomeIcon icon={faCreditCard} className="text-xl" />
                    <h4 className="font-bold text-lg">Como você vai pagar?</h4>
                  </div>
                  <Select
                    options={paymentOptions}
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="bg-white border-[#4169E1]/20 focus:ring-[#4169E1] h-12 text-lg font-medium"
                    label="Método de Pagamento"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Atenção: O pagamento deve ser feito diretamente ao vendedor no local.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Condição</div>
                    <Badge variant={getConditionVariant(scannedProduct.condition)}>
                      {formatProductCondition(scannedProduct.condition)}
                    </Badge>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                    <div className="text-xs text-gray-500 uppercase font-bold mb-1">Vendedor</div>
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                      <FontAwesomeIcon icon={faStore} className="text-[#4169E1]" />
                      {sellerInfo?.name || 'Vendedor'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button variant="secondary" onClick={handleCloseModal} className="flex-1">
                    Cancelar
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleBuy}
                    isLoading={isBuying}
                    className="flex-3 bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                  >
                    Confirmar Compra
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Time Limit Expired Modal */}
      <Modal
        isOpen={showTimeoutAlert}
        onClose={() => setShowTimeoutAlert(false)}
        title="Tempo Limite Expirado"
        size="sm"
      >
        <div className="text-center py-6 space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <FontAwesomeIcon icon={faTimes} className="text-3xl animate-bounce" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Tempo Limite Expirado</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            O tempo limite para o pagamento deste produto expirou. O produto foi liberado de volta ao catálogo e está disponível para outros compradores.
          </p>
          <div className="pt-4">
            <Button variant="primary" onClick={() => setShowTimeoutAlert(false)} className="w-full bg-red-600 hover:bg-red-700">
              Entendido
            </Button>
          </div>
        </div>
      </Modal>
    </BuyerLayout>
  );
}
