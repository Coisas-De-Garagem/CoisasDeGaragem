import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';
import { QRCodeDisplay } from '@/components/seller/QRCodeDisplay';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { EmptyState } from '@/components/common/EmptyState';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/utils/formatters';

export default function QRCodesPage() {
  const { products } = useProducts();
  const navigate = useNavigate();

  const handleGenerateQR = (productId: string) => {
    // TODO: Implementar chamada à API de geração de QR code.
    console.log('Generate QR for product:', productId);
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
                {product.qrCodeUrl ? (
                  <div className="flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGenerateQR(product.id)}
                    >
                      Regenerar
                    </Button>
                    <QRCodeDisplay product={product} qrCodeUrl={product.qrCodeUrl} />
                  </div>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => handleGenerateQR(product.id)}
                  >
                    Gerar QR code
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
