import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircleCheck,
  faCircleExclamation,
  faEye,
  faImage,
  faCamera,
  faChevronLeft,
  faChevronRight,
  faMagnifyingGlassPlus,
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ImageLightboxModal } from '@/components/common/ImageLightboxModal';
import type { Purchase } from '@/types';

interface PurchaseCardProps {
  purchase: Purchase;
  onViewDetails?: (purchase: Purchase) => void;
}

const statusConfig: Record<string, { label: string; variant: 'warning' | 'success' | 'error' }> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  COMPLETED: { label: 'Concluída', variant: 'success' },
  CANCELLED: { label: 'Cancelada', variant: 'error' },
  REFUNDED: { label: 'Reembolsada', variant: 'error' },
};

const paymentLabel: Record<string, string> = {
  PIX: 'PIX',
  CARD: 'Cartão',
  CASH: 'Dinheiro',
  OTHER: 'Outro',
};

export function PurchaseCard({ purchase, onViewDetails }: PurchaseCardProps) {
  const product = purchase.product;
  const images = (
    product?.images && product.images.length > 0
      ? product.images
      : product?.imageUrl
        ? [product.imageUrl]
        : []
  ).filter((img): img is string => Boolean(img && img.trim().length > 0));

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const normalizedStatus = (purchase.status || 'PENDING').toUpperCase();
  const config = statusConfig[normalizedStatus] || statusConfig.PENDING;
  const formattedDate = new Date(purchase.purchaseDate || purchase.createdAt).toLocaleDateString(
    'pt-BR',
    {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    },
  );
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: purchase.currency || 'BRL',
  }).format(Number(purchase.price));

  const paymentMethodKey = (purchase.paymentMethod || '').toUpperCase();
  const paymentText = paymentLabel[paymentMethodKey] || purchase.paymentMethod || 'Não informado';
  const currentImg = images[activeImgIndex];
  const productName = product?.name || `Compra #${purchase.id.slice(-6)}`;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setActiveImgIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setActiveImgIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handleOpenLightbox = (e: React.MouseEvent) => {
    if (images.length === 0) return;
    e.stopPropagation();
    setLightboxOpen(true);
  };

  return (
    <>
      <Card flush className="h-full flex flex-col group">
        {/* Foto clicável com navegação rápida e abertura do Lightbox */}
        <div
          className={`relative h-48 bg-surface-sunken overflow-hidden select-none ${
            currentImg ? 'cursor-zoom-in' : ''
          }`}
          onClick={handleOpenLightbox}
          role={currentImg ? 'button' : undefined}
          tabIndex={currentImg ? 0 : undefined}
          aria-label={currentImg ? `Ampliar fotos de ${productName}` : undefined}
          onKeyDown={(e) => {
            if (currentImg && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              setLightboxOpen(true);
            }
          }}
        >
          {currentImg ? (
            <img
              src={currentImg}
              alt={productName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-subtle">
              <FontAwesomeIcon icon={faImage} className="w-10 h-10 opacity-40" />
            </div>
          )}

          {/* Status */}
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <Badge variant={config.variant} dot className="shadow-sm backdrop-blur-sm">
              {config.label}
            </Badge>
          </div>

          {/* Contador de fotos */}
          {images.length > 1 && (
            <div className="absolute top-3 left-3 z-10 pointer-events-none">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-950/70 text-white backdrop-blur-md border border-white/10 shadow-sm">
                <FontAwesomeIcon icon={faCamera} className="w-2.5 h-2.5" />
                {activeImgIndex + 1}/{images.length}
              </span>
            </div>
          )}

          {/* Indicador de zoom */}
          {currentImg && (
            <div className="absolute bottom-3 right-3 z-10 pointer-events-none opacity-85 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-neutral-950/70 text-white backdrop-blur-md border border-white/15 shadow-sm">
                <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="w-3 h-3" />
              </span>
            </div>
          )}

          {/* Setas do carrossel */}
          {images.length > 1 && (
            <div className="absolute inset-y-0 inset-x-1.5 flex items-center justify-between pointer-events-none opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10">
              <button
                type="button"
                onClick={handlePrevImage}
                className="w-7 h-7 rounded-full bg-neutral-950/70 hover:bg-neutral-900 text-white flex items-center justify-center pointer-events-auto backdrop-blur-sm transition-transform active:scale-90 cursor-pointer"
                aria-label="Foto anterior"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="w-2.5 h-2.5" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="w-7 h-7 rounded-full bg-neutral-950/70 hover:bg-neutral-900 text-white flex items-center justify-center pointer-events-auto backdrop-blur-sm transition-transform active:scale-90 cursor-pointer"
                aria-label="Próxima foto"
              >
                <FontAwesomeIcon icon={faChevronRight} className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Corpo */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            {product?.category ? (
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                {product.category}
              </span>
            ) : (
              <span className="text-xs font-mono text-text-subtle">
                #{purchase.id.slice(-6)}
              </span>
            )}
            <span className="text-xs text-text-muted">{formattedDate}</span>
          </div>

          <h3 className="text-base font-semibold text-text-main leading-snug line-clamp-2">
            {productName}
          </h3>

          {product?.description && (
            <p className="text-sm text-text-muted line-clamp-2 mt-1">
              {product.description}
            </p>
          )}

          {purchase.seller?.name && (
            <p className="text-xs text-text-muted flex items-center gap-1.5 mt-2">
              <FontAwesomeIcon icon={faStore} className="w-3 h-3 text-text-subtle" />
              Vendedor: <span className="font-medium text-text-main">{purchase.seller.name}</span>
            </p>
          )}

          <div className="flex items-center justify-between py-3 border-y border-border mt-4">
            <div>
              <p className="text-xs text-text-muted">Valor pago</p>
              <p className="text-xl font-bold text-text-main">{formattedPrice}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Pagamento</p>
              <p className="text-sm font-medium text-text-main">{paymentText}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-3 pb-3 text-xs">
            {normalizedStatus === 'COMPLETED' || purchase.qrCodeScanned ? (
              <span className="inline-flex items-center gap-1.5 text-success font-medium">
                <FontAwesomeIcon icon={faCircleCheck} className="w-3.5 h-3.5" />
                {purchase.qrCodeScanned ? 'QR code escaneado' : 'Compra confirmada'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                <FontAwesomeIcon icon={faCircleExclamation} className="w-3.5 h-3.5" />
                Aguardando confirmação
              </span>
            )}
            <span className="font-mono text-text-subtle">#{purchase.id.slice(-6)}</span>
          </div>

          {onViewDetails && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              fullWidth
              className="mt-auto"
              onClick={() => onViewDetails(purchase)}
              leftIcon={<FontAwesomeIcon icon={faEye} />}
            >
              Ver detalhes
            </Button>
          )}
        </div>
      </Card>

      {lightboxOpen && (
        <ImageLightboxModal
          key={`${purchase.id}-${activeImgIndex}`}
          isOpen={lightboxOpen}
          images={images}
          initialIndex={activeImgIndex}
          title={productName}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
