import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { QRCodeDisplay } from '@/components/seller/QRCodeDisplay';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { useProducts } from '@/hooks/useProducts';
import { useProductsStore } from '@/store/productsStore';
import { useUIStore } from '@/store/uiStore';
import { api } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import { makeNotifier } from '@/utils/notifications';
import { generateProductPDF, printProductLabel } from '@/utils/pdfGenerator';
import type { Product } from '@/types';

export default function QRCodesPage() {
  const { products } = useProducts();
  const { updateProduct } = useProductsStore();
  const { addNotification } = useUIStore();
  const navigate = useNavigate();
  const notify = makeNotifier(addNotification);

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const handleGenerateQR = async (product: Product) => {
    setLoadingId(product.id);
    try {
      const result = await api.getQRCode(product.id);
      if (result.success) {
        const updatedProduct = { ...product, qrCodeUrl: result.data.url };
        updateProduct(product.id, updatedProduct);
        setActiveProduct(updatedProduct);
      } else {
        notify('error', 'Erro ao gerar QR code', result.error?.message || 'Tente novamente.');
      }
    } catch {
      notify('error', 'Erro ao gerar QR code', 'Ocorreu um erro inesperado.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDownloadPDF = async (product: Product) => {
    if (!product.qrCodeUrl) return;
    try {
      await generateProductPDF({
        name: product.name,
        price: product.price,
        currency: product.currency,
        qrCodeUrl: product.qrCodeUrl,
        category: product.category,
      });
      notify('success', 'PDF gerado', 'O PDF do produto foi gerado com sucesso.');
    } catch {
      notify('error', 'Erro ao gerar PDF', 'Ocorreu um erro ao gerar o PDF.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main">
          Meus QR Codes
        </h1>
        <p className="text-text-muted mt-1">
          Gerencie os QR codes dos seus produtos
        </p>
      </div>

      {products.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FontAwesomeIcon icon={faQrcode} />}
            title="Nenhum QR code gerado"
            description="Cadastre produtos para gerar seus QR codes e começar a vender."
            action={
              <Button variant="primary" onClick={() => navigate('/seller/products')}>
                Ir para produtos
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-text-main">
                  {product.name}
                </h3>
                <p className="text-sm text-text-muted line-clamp-2 mt-0.5">
                  {product.description}
                </p>
                <p className="text-lg font-bold text-primary mt-2">
                  {formatCurrency(Number(product.price))}
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant={product.qrCodeUrl ? 'outline' : 'primary'}
                  size="sm"
                  fullWidth
                  isLoading={loadingId === product.id}
                  leftIcon={<FontAwesomeIcon icon={faQrcode} />}
                  onClick={() => handleGenerateQR(product)}
                >
                  {product.qrCodeUrl ? 'Ver / Regenerar QR code' : 'Gerar QR code'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!activeProduct}
        onClose={() => setActiveProduct(null)}
        title="QR Code do produto"
        size="md"
      >
        {activeProduct && (
          <QRCodeDisplay
            product={activeProduct}
            qrCodeUrl={activeProduct.qrCodeUrl}
            onPrint={() => {
              if (!activeProduct.qrCodeUrl) return;
              void printProductLabel({
                name: activeProduct.name,
                price: Number(activeProduct.price),
                currency: activeProduct.currency,
                qrCodeUrl: activeProduct.qrCodeUrl,
                category: activeProduct.category,
              });
            }}
            onDownload={() => handleDownloadPDF(activeProduct)}
          />
        )}
      </Modal>
    </div>
  );
}
