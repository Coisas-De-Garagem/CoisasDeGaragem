import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import type { Product } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faQrcode, faImage, faCalendar, faFilePdf } from '@fortawesome/free-solid-svg-icons';

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
  const getConditionBadge = (condition?: string) => {
    const conditionMap: Record<string, { label: string; variant: 'success' | 'warning' | 'error' }> = {
      'NEW': { label: 'Novo', variant: 'success' },
      'LIKE_NEW': { label: 'Como Novo', variant: 'success' },
      'GOOD': { label: 'Bom', variant: 'success' },
      'FAIR': { label: 'Razoável', variant: 'warning' },
      'POOR': { label: 'Ruim', variant: 'error' },
    };

    return conditionMap[condition || 'GOOD'] || { label: 'Bom', variant: 'success' };
  };

  const conditionBadge = getConditionBadge(product.condition);

  return (
    <Card hoverable className="overflow-hidden h-full flex flex-col border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Product Image */}
      <div className="relative h-56 bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <FontAwesomeIcon icon={faImage} className="text-5xl opacity-50" />
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3 shadow-sm z-10">
          {product.isSold ? (
            <Badge variant="error" className="shadow-lg font-bold px-3">Vendido</Badge>
          ) : product.isReserved ? (
            <Badge variant="warning" className="shadow-lg font-bold px-3">Reservado</Badge>
          ) : (
            <Badge variant="success" className="shadow-lg font-bold px-3">Disponível</Badge>
          )}
        </div>

        {/* Condition Badge (Overlay bottom left) */}
        <div className="absolute bottom-3 left-3 z-10">
          <Badge variant={conditionBadge.variant} className="shadow-sm font-semibold">
            {conditionBadge.label}
          </Badge>
        </div>
      </div>

      {/* Product Info */}
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div>
            {product.category && (
              <span className="text-xs font-semibold text-[#4169E1] bg-blue-50 px-2 py-1 rounded-full mb-2 inline-block">
                {product.category}
              </span>
            )}
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#4169E1] transition-colors">
              {product.name}
            </h3>
          </div>
          <div className="text-right whitespace-nowrap">
            <p className="text-xl font-bold text-[#4169E1]">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: product.currency,
              }).format(product.price)}
            </p>
          </div>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        {/* Status Actions for Seller */}
        {showActions && onStatusChange && (
          <div className="flex gap-2 mb-4">
            {!product.isAvailable && !product.isSold && (
              <Button
                variant="tertiary"
                size="sm"
                className="flex-1 text-xs py-1 border-emerald-100 hover:bg-emerald-50 text-emerald-700"
                onClick={() => onStatusChange(product.id, 'available')}
              >
                Disponibilizar
              </Button>
            )}
            {!product.isSold && (
              <Button
                variant="tertiary"
                size="sm"
                className="flex-1 text-xs py-1 border-red-100 hover:bg-red-50 text-red-700"
                onClick={() => onStatusChange(product.id, 'sold')}
              >
                Marcar Vendido
              </Button>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon icon={faCalendar} />
            {new Date(product.createdAt).toLocaleDateString('pt-BR', {
              day: '2-digit', month: 'short'
            })}
          </div>

          {product.qrCodeUrl && (
            <div className="flex items-center gap-1.5 text-[#4169E1] font-medium bg-blue-50 px-2 py-1 rounded-md">
              <FontAwesomeIcon icon={faQrcode} />
              <span>Link Ativo</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="p-4 bg-gray-50/80 border-t border-gray-100 grid grid-cols-4 gap-2 backdrop-blur-sm">
          {onEdit && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => onEdit(product)}
              className="flex items-center justify-center bg-white text-gray-700 hover:text-[#4169E1] hover:border-[#4169E1] transition-colors shadow-sm"
              title="Editar"
            >
              <FontAwesomeIcon icon={faEdit} />
            </Button>
          )}
          {onGenerateQR && (
            <Button
              variant={product.qrCodeUrl ? "tertiary" : "primary"}
              size="sm"
              onClick={() => onGenerateQR(product)}
              className={`flex items-center justify-center transition-colors shadow-sm ${product.qrCodeUrl
                ? 'bg-white text-emerald-600 hover:text-emerald-700 hover:border-emerald-500'
                : 'bg-[#4169E1] hover:bg-[#3154b3] text-white'
                }`}
              title={product.qrCodeUrl ? "Ver QR Code" : "Gerar QR Code"}
            >
              <FontAwesomeIcon icon={faQrcode} />
            </Button>
          )}
          {onDownloadPDF && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => onDownloadPDF(product)}
              disabled={!product.qrCodeUrl}
              className={`flex items-center justify-center bg-white text-red-600 hover:text-red-700 hover:border-red-500 transition-colors shadow-sm ${!product.qrCodeUrl ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
              title="Baixar Etiqueta PDF"
            >
              <FontAwesomeIcon icon={faFilePdf} />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="flex items-center justify-center bg-white text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
              title="Excluir"
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
