import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import type { Purchase } from '@/types';

interface PurchaseCardProps {
  purchase: Purchase;
  onViewDetails?: (purchase: Purchase) => void;
}

const statusConfig = {
  pending: { label: 'Pendente', variant: 'warning' as const },
  completed: { label: 'Concluído', variant: 'success' as const },
  cancelled: { label: 'Cancelado', variant: 'error' as const },
  refunded: { label: 'Reembolsado', variant: 'error' as const },
};

export function PurchaseCard({ purchase, onViewDetails }: PurchaseCardProps) {
  const purchaseStatusKey: keyof typeof statusConfig = purchase.status as keyof typeof statusConfig;
  const config = statusConfig[purchaseStatusKey] || statusConfig.pending;
  const formattedDate = new Date(purchase.purchaseDate).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(purchase.price);

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Compra #{purchase.id.slice(-6)}
            </h3>
            <p className="text-sm text-gray-600">
              {formattedDate}
            </p>
          </div>
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        </div>

        {/* Product Info */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Produto
          </h4>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                ID do Produto: {purchase.productId}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Produto disponível no painel do vendedor
              </p>
            </div>
          </div>
        </div>

        {/* Price and Payment */}
        <div className="flex justify-between items-center py-4 border-t border-b border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Valor pago:</p>
            <p className="text-2xl font-bold text-primary">
              {formattedPrice}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Método:</p>
            <p className="font-medium text-gray-900 capitalize">
              {purchase.paymentMethod || 'Não informado'}
            </p>
          </div>
        </div>

        {/* QR Code Scanned Status */}
        <div className="flex items-center gap-2 py-3">
          {purchase.qrCodeScanned ? (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l4 4L17 7" />
              </svg>
              <span className="text-sm font-medium">QR Code escaneado</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 0l6-6m6 6l6 6M12 3v2m0 0l-6 6m-6 6l-6 6" />
              </svg>
              <span className="text-sm font-medium">QR Code não escaneado</span>
            </div>
          )}
        </div>

        {/* Actions */}
        {onViewDetails && (
          <div className="pt-4">
            <Button
              variant="secondary"
              onClick={() => onViewDetails(purchase)}
              fullWidth
            >
              Ver Detalhes
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
