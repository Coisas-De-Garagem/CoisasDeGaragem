import { useState, useRef, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faExpand,
  faXmark,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { lockScroll, unlockScroll } from './Modal';

interface ProductImageGalleryProps {
  images?: string[];
  imageUrl?: string;
  alt?: string;
  className?: string;
  imageClassName?: string;
  aspectRatio?: string;
  showThumbnails?: boolean;
  showIndicators?: boolean;
  allowFullscreen?: boolean;
  badge?: React.ReactNode;
  conditionBadge?: React.ReactNode;
}

export function ProductImageGallery({
  images: rawImages,
  imageUrl,
  alt = 'Imagem do produto',
  className = '',
  imageClassName = 'object-cover',
  aspectRatio = 'aspect-square',
  showThumbnails = true,
  showIndicators = true,
  allowFullscreen = true,
  badge,
  conditionBadge,
}: ProductImageGalleryProps) {
  // Consolidate images array
  const imageList = (
    rawImages && rawImages.length > 0
      ? rawImages
      : imageUrl
        ? [imageUrl]
        : []
  ).filter((img): img is string => Boolean(img && img.trim().length > 0));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageErrorMap, setImageErrorMap] = useState<Record<number, boolean>>({});

  // Touch gesture coordinates
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const total = imageList.length;

  // Navigate next / prev with wrap-around
  const goToNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (total <= 1) return;
      setCurrentIndex((prev) => (prev + 1) % total);
    },
    [total],
  );

  const goToPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (total <= 1) return;
      setCurrentIndex((prev) => (prev - 1 + total) % total);
    },
    [total],
  );

  const goToIndex = (idx: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (idx >= 0 && idx < total) {
      setCurrentIndex(idx);
    }
  };

  // Scroll active thumbnail into view
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[currentIndex] as HTMLElement | undefined;
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  }, [currentIndex]);

  // Touch event handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diffX = touchStartX.current - touchEndX.current;
    const diffY = (touchStartY.current || 0) - (touchEndY.current || 0);

    // Only trigger if horizontal swipe is significantly greater than vertical scroll
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  // Keyboard navigation when in fullscreen or focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFullscreen) {
        if (e.key === 'ArrowRight') goToNext();
        else if (e.key === 'ArrowLeft') goToPrev();
        else if (e.key === 'Escape') setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, goToNext, goToPrev]);

  // Lock body & html scroll when in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }
  }, [isFullscreen]);

  const handleImageError = (index: number) => {
    setImageErrorMap((prev) => ({ ...prev, [index]: true }));
  };

  // Render empty state if no images available
  if (total === 0) {
    return (
      <div
        className={`relative ${aspectRatio} w-full rounded-xl bg-surface-sunken border border-border flex flex-col items-center justify-center text-text-subtle gap-2 overflow-hidden ${className}`}
      >
        {badge && <div className="absolute top-3 right-3 z-10">{badge}</div>}
        {conditionBadge && <div className="absolute bottom-3 left-3 z-10">{conditionBadge}</div>}
        <FontAwesomeIcon icon={faImage} className="w-12 h-12 opacity-30" />
        <span className="text-sm font-medium">Sem imagem</span>
      </div>
    );
  }

  const currentImageSrc = imageList[currentIndex];
  const isCurrentError = imageErrorMap[currentIndex];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className={`relative group ${aspectRatio} w-full rounded-xl overflow-hidden bg-surface-sunken border border-border select-none`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Badges */}
        {badge && <div className="absolute top-3 right-3 z-20 pointer-events-none">{badge}</div>}
        {conditionBadge && (
          <div className="absolute bottom-3 left-3 z-20 pointer-events-none">{conditionBadge}</div>
        )}

        {/* Counter Badge (e.g. 1/4) */}
        {total > 1 && (
          <div className="absolute top-3 left-3 z-20 pointer-events-none">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-950/70 text-white backdrop-blur-md shadow-sm border border-white/10">
              {currentIndex + 1} / {total}
            </span>
          </div>
        )}

        {/* Fullscreen Button */}
        {allowFullscreen && !isCurrentError && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(true);
            }}
            className="absolute bottom-3 right-3 z-20 p-2 rounded-lg bg-neutral-950/70 text-white hover:bg-neutral-900 backdrop-blur-md border border-white/10 shadow-sm transition-all opacity-85 hover:opacity-100 active:scale-95 flex items-center justify-center cursor-pointer"
            title="Ver em tela cheia"
            aria-label="Ver imagem em tela cheia"
          >
            <FontAwesomeIcon icon={faExpand} className="w-4 h-4" />
          </button>
        )}

        {/* The Main Image */}
        <div
          className="w-full h-full flex items-center justify-center cursor-pointer transition-transform duration-300"
          onClick={() => allowFullscreen && !isCurrentError && setIsFullscreen(true)}
        >
          {isCurrentError ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-text-subtle gap-2">
              <FontAwesomeIcon icon={faImage} className="w-10 h-10 opacity-30" />
              <span className="text-xs">Não foi possível carregar a imagem</span>
            </div>
          ) : (
            <img
              key={currentImageSrc}
              src={currentImageSrc}
              alt={`${alt} - Foto ${currentIndex + 1} de ${total}`}
              className={`w-full h-full ${imageClassName} transition-opacity duration-300`}
              onError={() => handleImageError(currentIndex)}
              loading="lazy"
            />
          )}
        </div>

        {/* Navigation Arrows (Desktop & Hover, Visible on hover or touch) */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-950/60 hover:bg-neutral-900 text-white backdrop-blur-md border border-white/10 flex items-center justify-center shadow-md transition-all sm:opacity-0 sm:group-hover:opacity-100 active:scale-90 cursor-pointer"
              aria-label="Imagem anterior"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-neutral-950/60 hover:bg-neutral-900 text-white backdrop-blur-md border border-white/10 flex items-center justify-center shadow-md transition-all sm:opacity-0 sm:group-hover:opacity-100 active:scale-90 cursor-pointer"
              aria-label="Próxima imagem"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {/* Pagination Dots (Mobile) */}
        {showIndicators && total > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-950/40 backdrop-blur-md pointer-events-none">
            {imageList.map((_, idx) => (
              <span
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-5 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails Strip (Below Main Image) */}
      {showThumbnails && total > 1 && (
        <div
          ref={thumbnailsRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth"
        >
          {imageList.map((img, idx) => {
            const isSelected = idx === currentIndex;
            const isErr = imageErrorMap[idx];
            return (
              <button
                key={idx}
                type="button"
                onClick={(e) => goToIndex(idx, e)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all active:scale-95 bg-surface-sunken cursor-pointer ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/30 shadow-md scale-100'
                    : 'border-border opacity-70 hover:opacity-100 hover:border-border-strong'
                }`}
                aria-label={`Ver foto ${idx + 1}`}
              >
                {isErr ? (
                  <div className="w-full h-full flex items-center justify-center text-text-subtle">
                    <FontAwesomeIcon icon={faImage} className="w-4 h-4 opacity-40" />
                  </div>
                ) : (
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {idx === 0 && (
                  <span className="absolute bottom-0 inset-x-0 bg-primary/90 text-white text-[9px] font-semibold text-center py-0.5 uppercase tracking-wider">
                    Capa
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-xl flex flex-col justify-between p-4 animate-fade-in"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Header */}
          <div className="flex items-center justify-between z-30 pt-2 px-2 text-white">
            <span className="text-sm font-semibold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
              {currentIndex + 1} de {total}
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all active:scale-95 cursor-pointer"
              aria-label="Fechar visualizador"
            >
              <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
            </button>
          </div>

          {/* Central Image with swipe */}
          <div
            className="relative flex-1 flex items-center justify-center my-auto max-h-[80vh] select-none"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {isCurrentError ? (
              <div className="flex flex-col items-center text-white/50 gap-2">
                <FontAwesomeIcon icon={faImage} className="w-12 h-12" />
                <span>Imagem indisponível</span>
              </div>
            ) : (
              <img
                src={currentImageSrc}
                alt={`${alt} - Tela cheia ${currentIndex + 1}`}
                className="max-h-[75vh] max-w-[95vw] object-contain rounded-lg shadow-2xl transition-transform"
              />
            )}

            {/* Lightbox Nav Arrows */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={goToPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  aria-label="Anterior"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                  aria-label="Próxima"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails in Lightbox */}
          {total > 1 && (
            <div
              className="flex justify-center items-center gap-2 overflow-x-auto py-2 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => goToIndex(idx)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'border-primary scale-110 shadow-lg'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
