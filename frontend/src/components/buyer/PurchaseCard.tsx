import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleCheck, faCircleExclamation, faQrcode } from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { Purchase } from '@/types';

interface PurchaseCardProps {
  purchase: Purchase;
  onViewDetails?: (purchase: Purchase) => void;
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'error' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  completed: { label: 'Concluído', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'error' },
  refunded: { label: 'Reembolsado', variant: 'error' },
};

const paymentLabel: Record<string, string> = {
  pix: 'PIX',
  card: 'Cartão',
  cash: 'Dinheiro',
  other: 'Outro',
};

export function PurchaseCard({ purchase, onViewDetails }: PurchaseCardProps) {
  const config = statusConfig[purchase.status as string] || statusConfig.pending;
  const formattedDate = new Date(purchase.purchaseDate).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: purchase.currency || 'BRL',
  }).format(purchase.price);

  return (
    <Card className="h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-text-main">
            Compra #{purchase.id.slice(-6)}
          </h3>
          <p className="text-sm text-text-muted mt-0.5">{formattedDate}</p>
        </div>
        <Badge variant={config.variant} dot>{config.label}</Badge>
      </div>

      <div className="mb-4">
        <p className="text-xs uppercase tracking-wider text-text-subtle font-semibold mb-1">
          Produto
        </p>
        <p className="font-medium text-text-main truncate" title={purchase.productId}>
          {purchase.productId}
        </p>
      </div>

      <div className="flex items-center justify-between py-3 border-y border-border mt-auto">
        <div>
          <p className="text-xs text-text-muted">Valor</p>
          <p className="text-xl font-bold text-text-main">{formattedPrice}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">Pagamento</p>
          <p className="text-sm font-medium text-text-main">
            {purchase.paymentMethod
              ? paymentLabel[purchase.paymentMethod] || purchase.paymentMethod
              : 'Não informado'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 py-3 text-sm">
        {purchase.qrCodeScanned ? (
          <span className="inline-flex items-center gap-1.5 text-success">
            <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4" />
            QR code escaneado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
            <FontAwesomeIcon icon={faCircleExclamation} className="w-4 h-4" />
            QR code não escaneado
          </span>
        )}
      </div>

      {onViewDetails && (
        <Button
          variant="outline"
          fullWidth
          onClick={() => onViewDetails(purchase)}
          leftIcon={<FontAwesomeIcon icon={faQrcode} />}
        >
          Ver detalhes
        </Button>
      )}
    </Card>
  );
}
