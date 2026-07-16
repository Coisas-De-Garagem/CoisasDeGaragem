import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faTrashCan,
  faQrcode,
  faImage,
  faCalendarDay,
  faFilePdf,
} from '@fortawesome/free-solid-svg-icons';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { IconButton } from '@/components/common/IconButton';
import { Tooltip } from '@/components/common/Tooltip';
import type { Product } from '@/types';
import { formatProductCondition, getConditionVariant } from '@/utils/formatters';

interface ProductCardProps {
  product: Product;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  onGenerateQR?: (product: Product) => void;
  onDownloadPDF?: (product: Product) => void;
  onStatusChange?: (productId: string, status: 'available' | 'reserved' | 'sold') => void;
  showActions?: boolean;
}

export function ProductCard({
  product,
  onEdit,
  onDelete,
  onGenerateQR,
  onDownloadPDF,
  onStatusChange,
  showActions = true,
}: ProductCardProps) {
  const conditionLabel = formatProductCondition(product.condition);
  const conditionVariant = getConditionVariant(product.condition);
  const price = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: product.currency,
  }).format(product.price);

  return (
    <Card hoverable flush className="h-full flex flex-col">
      {/* Imagem */}
      <div className="relative h-48 bg-surface-sunken overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-subtle">
            <FontAwesomeIcon icon={faImage} className="w-10 h-10 opacity-40" />
          </div>
        )}

        <div className="absolute top-3 right-3 z-10">
          {product.isSold ? (
            <Badge variant="error">Vendido</Badge>
          ) : product.isReserved ? (
            <Badge variant="warning">Reservado</Badge>
          ) : (
            <Badge variant="success" dot>
              Disponível
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 left-3 z-10">
          <Badge variant={conditionVariant}>{conditionLabel}</Badge>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 p-4 flex flex-col">
        {product.category && (
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full inline-block mb-1.5 w-fit">
            {product.category}
          </span>
        )}
        <h3 className="text-base font-semibold text-text-main leading-snug line-clamp-2">
          {product.name}
        </h3>
        <p className="text-text-muted text-sm line-clamp-2 mt-1 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-3">
          <p className="text-xl font-bold text-text-main">{price}</p>
          {product.qrCodeUrl && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
              <FontAwesomeIcon icon={faQrcode} className="w-3.5 h-3.5" />
              QR ativo
            </span>
          )}
        </div>

        {/* Ações de status */}
        {showActions && onStatusChange && !product.isSold && (
          <div className="flex gap-2 mt-4">
            {!product.isAvailable && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onStatusChange(product.id, 'available')}
              >
                Disponibilizar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 text-error hover:bg-error/10"
              onClick={() => onStatusChange(product.id, 'sold')}
            >
              Marcar vendido
            </Button>
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-border text-xs text-text-subtle">
          <FontAwesomeIcon icon={faCalendarDay} className="w-3.5 h-3.5" />
          {new Date(product.createdAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })}
        </div>
      </div>

      {/* Ações rápidas */}
      {showActions && (
        <div className="grid grid-cols-4 gap-1 p-3 bg-surface-sunken/50 border-t border-border">
          {onEdit && (
            <Tooltip content="Editar" side="top">
              <IconButton variant="ghost" label="Editar produto" onClick={() => onEdit(product)}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </IconButton>
            </Tooltip>
          )}
          {onGenerateQR && (
            <Tooltip content={product.qrCodeUrl ? 'Ver QR code' : 'Gerar QR code'} side="top">
              <IconButton
                variant={product.qrCodeUrl ? 'ghost' : 'primary'}
                label={product.qrCodeUrl ? 'Ver QR code' : 'Gerar QR code'}
                onClick={() => onGenerateQR(product)}
              >
                <FontAwesomeIcon icon={faQrcode} />
              </IconButton>
            </Tooltip>
          )}
          {onDownloadPDF && (
            <Tooltip content="Baixar etiqueta PDF" side="top">
              <IconButton
                variant="ghost"
                label="Baixar PDF"
                onClick={() => onDownloadPDF(product)}
                disabled={!product.qrCodeUrl}
              >
                <FontAwesomeIcon icon={faFilePdf} />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip content="Excluir" side="top">
              <IconButton
                variant="danger"
                label="Excluir produto"
                onClick={() => onDelete(product.id)}
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </IconButton>
            </Tooltip>
          )}
        </div>
      )}
    </Card>
  );
}
