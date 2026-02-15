import { BuyerLayout } from '@/components/buyer/BuyerLayout';
import { QRScanner } from '@/components/buyer/QRScanner';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Select } from '@/components/common/Select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faShoppingBag, faLightbulb, faStore, faCheckCircle, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import type { Product, User, PaymentMethod } from '@/types';
import { api } from '@/services/api';
import { useUIStore } from '@/store/uiStore';

export default function BuyerDashboard() {
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [sellerInfo, setSellerInfo] = useState<User | null>(null);
  const [isBuying, setIsBuying] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const { addNotification } = useUIStore();

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
                onClick={() => window.location.href = '/buyer/qr-scanner'}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20"
              >
                Ir para Scanner QR
              </button>
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-xl overflow-hidden text-white">
          <div className="p-8 lg:p-12">
            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
              <FontAwesomeIcon icon={faLightbulb} className="text-yellow-400" />
              Como Começar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold text-lg border border-blue-500/30">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-blue-100">
                    Escanear QR Code
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Aponte a câmera do celular para o código do produto que você gostou no garage sale.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-lg border border-indigo-500/30">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-indigo-100">
                    Ver Minhas Compras
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Acesse seu histórico completo e detalhes de cada item adquirido.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-emerald-100">
                    Configurar Perfil
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Mantenha seus dados atualizados para facilitar o contato com vendedores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <Modal
        isOpen={!!scannedProduct}
        onClose={() => setScannedProduct(null)}
        title={purchaseSuccess ? "Compra Realizada!" : "Detalhes do Produto"}
        size="md"
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
                  <Button variant="primary" onClick={() => setScannedProduct(null)} className="w-full">
                    Fechar
                  </Button>
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
                    <Badge variant="success">{scannedProduct.condition || 'Bom'}</Badge>
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
                  <Button variant="secondary" onClick={() => setScannedProduct(null)} className="flex-1">
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
    </BuyerLayout>
  );
}
