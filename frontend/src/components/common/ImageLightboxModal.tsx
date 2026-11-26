import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight,
  faXmark,
  faMagnifyingGlassPlus,
  faMagnifyingGlassMinus,
  faRotateLeft,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { lockScroll, unlockScroll } from '@/utils/scrollLock';

interface ImageLightboxModalProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  title?: string;
  onClose: () => void;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

export function ImageLightboxModal({
  isOpen,
  images,
  initialIndex = 0,
  title,
  onClose,
}: ImageLightboxModalProps) {
  const safeInitial =
    images.length > 0
      ? Math.min(Math.max(0, initialIndex), images.length - 1)
      : 0;

  const [currentIndex, setCurrentIndex] = useState(safeInitial);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [errorMap, setErrorMap] = useState<Record<number, boolean>>({});

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const swipeRef = useRef<{ startX: number; startY: number } | null>(null);

  const total = images.length;

  const resetTransform = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  const goToIndex = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= total) return;
      setCurrentIndex(idx);
      resetTransform();
    },
    [total, resetTransform],
  );

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
    resetTransform();
  }, [total, resetTransform]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
    resetTransform();
  }, [total, resetTransform]);

  const clampOffset = useCallback(
    (next: { x: number; y: number }, nextZoom: number) => {
      if (nextZoom <= 1) return { x: 0, y: 0 };
      const rect = stageRef.current?.getBoundingClientRect();
      const maxX = rect ? (rect.width * (nextZoom - 1)) / 2 : 400;
      const maxY = rect ? (rect.height * (nextZoom - 1)) / 2 : 300;
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [],
  );

  const applyZoom = useCallback(
    (nextZoomRaw: number) => {
      const nextZoom = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, Number(nextZoomRaw.toFixed(2))),
      );
      setZoom(nextZoom);
      setOffset((prev) => clampOffset(prev, nextZoom));
    },
    [clampOffset],
  );

  // Bloqueia scroll da página enquanto o modal está aberto.
  useEffect(() => {
    if (!isOpen) return;
    lockScroll();
    return () => unlockScroll();
  }, [isOpen]);

  // Navegação por teclado (setas, Esc, +, -, 0).
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === '+' || e.key === '=') applyZoom(zoom + 0.35);
      else if (e.key === '-') applyZoom(zoom - 0.35);
      else if (e.key === '0') resetTransform();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, goToNext, goToPrev, applyZoom, zoom, resetTransform]);

  // Listener nativo de wheel com passive: false para impedir scroll da página ao dar zoom.
  useEffect(() => {
    const el = stageRef.current;
    if (!isOpen || !el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.25 : -0.25;
      setZoom((prevZoom) => {
        const nextZoom = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, Number((prevZoom + delta).toFixed(2))),
        );
        setOffset((prevOffset) => clampOffset(prevOffset, nextZoom));
        return nextZoom;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isOpen, clampOffset]);

  if (!isOpen || total === 0) return null;

  const currentSrc = images[currentIndex];
  const isError = errorMap[currentIndex];

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (zoom > 1) {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: offset.x,
        originY: offset.y,
      };
    } else if (e.pointerType === 'touch') {
      swipeRef.current = { startX: e.clientX, startY: e.clientY };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setOffset(
      clampOffset({ x: drag.originX + dx, y: drag.originY + dy }, zoom),
    );
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag && drag.pointerId === e.pointerId) {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      dragRef.current = null;
      setIsDragging(false);
      return;
    }

    const swipe = swipeRef.current;
    if (swipe && zoom === 1) {
      const dx = swipe.startX - e.clientX;
      const dy = swipe.startY - e.clientY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 45) {
        if (dx > 0) goToNext();
        else goToPrev();
      }
      swipeRef.current = null;
    }
  };

  const handleDoubleClick = () => {
    if (zoom > 1) resetTransform();
    else applyZoom(2.2);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-neutral-950/95 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-5 animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Visualizador de fotos: ${title}` : 'Visualizador de fotos'}
      onClick={onClose}
    >
      {/* Barra superior */}
      <div
        className="flex items-center justify-between gap-3 z-30 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="shrink-0 text-xs sm:text-sm font-semibold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {currentIndex + 1} / {total}
          </span>
          {title && (
            <p className="text-sm font-medium text-white/90 truncate hidden sm:block">
              {title}
            </p>
          )}
        </div>

        {/* Controles de zoom + fechar */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full px-1.5 py-1 border border-white/10">
            <button
              type="button"
              onClick={() => applyZoom(zoom - 0.35)}
              disabled={zoom <= MIN_ZOOM}
              className="w-8 h-8 rounded-full hover:bg-white/15 disabled:opacity-35 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Diminuir zoom"
              title="Diminuir zoom (-)"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassMinus} className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-mono min-w-[42px] text-center text-white/90">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => applyZoom(zoom + 0.35)}
              disabled={zoom >= MAX_ZOOM}
              className="w-8 h-8 rounded-full hover:bg-white/15 disabled:opacity-35 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Aumentar zoom"
              title="Aumentar zoom (+)"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="w-3.5 h-3.5" />
            </button>
            {zoom > 1 && (
              <button
                type="button"
                onClick={resetTransform}
                className="w-8 h-8 rounded-full hover:bg-white/15 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Resetar zoom"
                title="Resetar zoom (0)"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            aria-label="Fechar visualizador"
            title="Fechar (Esc)"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Palco central com zoom por scroll e arraste */}
      <div
        ref={stageRef}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={handleDoubleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`relative flex-1 my-3 flex items-center justify-center overflow-hidden touch-none ${
          zoom > 1
            ? isDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
            : 'cursor-zoom-in'
        }`}
      >
        {isError ? (
          <div className="flex flex-col items-center text-white/50 gap-2">
            <FontAwesomeIcon icon={faImage} className="w-12 h-12" />
            <span className="text-sm">Imagem indisponível</span>
          </div>
        ) : (
          <img
            key={currentSrc}
            src={currentSrc}
            alt={`${title || 'Foto'} (${currentIndex + 1} de ${total})`}
            draggable={false}
            onError={() => setErrorMap((prev) => ({ ...prev, [currentIndex]: true }))}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            }}
            className={`max-h-[72vh] max-w-[92vw] object-contain rounded-lg shadow-2xl will-change-transform ${
              isDragging ? '' : 'transition-transform duration-150 ease-out'
            }`}
          />
        )}

        {/* Setas de navegação */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/12 hover:bg-white/25 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              aria-label="Foto anterior"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/12 hover:bg-white/25 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all active:scale-90 cursor-pointer"
              aria-label="Próxima foto"
            >
              <FontAwesomeIcon icon={faChevronRight} className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Rodapé: dica + miniaturas */}
      <div
        className="flex flex-col items-center gap-2 z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-[11px] sm:text-xs text-white/60 text-center">
          Use a roda do mouse ou clique duas vezes para dar zoom · Arraste para mover
        </p>

        {total > 1 && (
          <div className="flex justify-center items-center gap-2 overflow-x-auto max-w-full py-1 px-2 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToIndex(idx)}
                className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === currentIndex
                    ? 'border-primary scale-105 shadow-lg ring-2 ring-primary/40'
                    : 'border-white/25 opacity-60 hover:opacity-100'
                }`}
                aria-label={`Ver foto ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Miniatura ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
