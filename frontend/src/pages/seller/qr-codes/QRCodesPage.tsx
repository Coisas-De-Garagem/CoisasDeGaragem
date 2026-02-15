import { SellerLayout } from '@/components/seller/SellerLayout';
import { QRCodeDisplay } from '@/components/seller/QRCodeDisplay';
import { Button } from '@/components/common/Button';
import { useProducts } from '@/hooks/useProducts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBox } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '@/utils/formatters';

export default function QRCodesPage() {
  const { products } = useProducts();


  const handleGenerateQR = (productId: string) => {
    console.log('Generate QR for product:', productId);
    // TODO: Implement QR code generation API call
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Meus QR Codes
            </h1>
            <p className="text-gray-600">
              Gereie e gerencie os QR codes dos seus produtos
            </p>
          </div>
        </div>

        {/* Products with QR Codes */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <FontAwesomeIcon icon={faBox} className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum QR Code gerado
            </h3>
            <p className="text-gray-600 mb-6">
              Gereie QR codes para seus produtos começando a vendê-los
            </p>
            <Button variant="primary" onClick={() => window.location.href = '/seller/products'}>
              Gerar Primeiro QR Code
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {product.description}
                    </p>
                    <p className="text-lg font-bold text-primary mt-2">
                      {formatCurrency(Number(product.price))}
                    </p>
                  </div>
                  {product.qrCodeUrl ? (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleGenerateQR(product.id)}
                      >
                        Regenerar QR
                      </Button>
                      <QRCodeDisplay
                        product={product}
                        qrCodeUrl={product.qrCodeUrl}
                      />
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleGenerateQR(product.id)}
                    >
                      Gerar QR Code
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
