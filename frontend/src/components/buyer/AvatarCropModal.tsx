import { useCallback, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlassMinus,
  faMagnifyingGlassPlus,
  faRotateRight,
  faArrowsToDot,
  faImage,
  faCheck,
  faUpDownLeftRight,
} from '@fortawesome/free-solid-svg-icons';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

interface AvatarCropModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  isUploading?: boolean;
  onClose: () => void;
  onChangeFile: () => void;
  onConfirm: (croppedFile: File) => Promise<void>;
}

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const OUTPUT_SIZE = 512;

interface ImageDimensions {
  width: number;
  height: number;
}

export function AvatarCropModal({
  isOpen,
  imageSrc,
  fileName = 'avatar.webp',
  isUploading = false,
  onClose,
  onChangeFile,
  onConfirm,
}: AvatarCropModalProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [imgSize, setImgSize] = useState<ImageDimensions | null>(null);
  const [stageSize, setStageSize] = useState(260);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  // Mede o tamanho real do palco responsivo (mobile vs notebook/desktop).
  useEffect(() => {
    if (!isOpen) return;
    const measure = () => {
      if (stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        if (rect.width > 0) setStageSize(rect.width);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  // Calcula dimensões efetivas da imagem considerando rotação (0/90/180/270).
  const getRotatedDimensions = useCallback(
    (dims: ImageDimensions, rot: number) => {
      const swapped = ((rot % 360) + 360) % 180 !== 0;
      return swapped
        ? { width: dims.height, height: dims.width }
        : { width: dims.width, height: dims.height };
    },
    [],
  );

  // Escala base para que o menor lado da imagem cubra todo o círculo do palco.
  const getBaseScale = useCallback(
    (dims: ImageDimensions, rot: number, viewport: number) => {
      const rotated = getRotatedDimensions(dims, rot);
      return Math.max(viewport / rotated.width, viewport / rotated.height);
    },
    [getRotatedDimensions],
  );

  // Limita o deslocamento para nunca expor bordas vazias dentro do círculo.
  const clampOffset = useCallback(
    (
      next: { x: number; y: number },
      nextZoom: number,
      nextRot: number,
      dims: ImageDimensions | null,
      viewport: number,
    ) => {
      if (!dims) return { x: 0, y: 0 };
      const rotated = getRotatedDimensions(dims, nextRot);
      const scale = getBaseScale(dims, nextRot, viewport) * nextZoom;
      const maxX = Math.max(0, (rotated.width * scale - viewport) / 2);
      const maxY = Math.max(0, (rotated.height * scale - viewport) / 2);
      return {
        x: Math.min(maxX, Math.max(-maxX, next.x)),
        y: Math.min(maxY, Math.max(-maxY, next.y)),
      };
    },
    [getBaseScale, getRotatedDimensions],
  );

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    imageRef.current = img;
    const dims = { width: img.naturalWidth, height: img.naturalHeight };
    setImgSize(dims);
    setOffset({ x: 0, y: 0 });
  };

  const updateZoom = (value: number) => {
    const clampedZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(value.toFixed(2))));
    setZoom(clampedZoom);
    setOffset((prev) => clampOffset(prev, clampedZoom, rotation, imgSize, stageSize));
  };

  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    setOffset((prev) => clampOffset(prev, zoom, nextRot, imgSize, stageSize));
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imgSize || isUploading || isExporting) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStartRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    setOffset(
      clampOffset(
        { x: drag.originX + dx, y: drag.originY + dy },
        zoom,
        rotation,
        imgSize,
        stageSize,
      ),
    );
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragStartRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    dragStartRef.current = null;
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!imgSize || isUploading || isExporting) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.12 : -0.12;
    updateZoom(zoom + delta);
  };

  // Gera o arquivo final 512x512 correspondendo exatamente ao enquadramento visível.
  const handleConfirmCrop = async () => {
    const img = imageRef.current;
    if (!img || !imgSize) return;

    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Não foi possível preparar o recorte da imagem.');

      const ratio = OUTPUT_SIZE / stageSize;
      const scale = getBaseScale(imgSize, rotation, stageSize) * zoom * ratio;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.clearRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

      ctx.save();
      ctx.translate(OUTPUT_SIZE / 2 + offset.x * ratio, OUTPUT_SIZE / 2 + offset.y * ratio);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.drawImage(img, -imgSize.width / 2, -imgSize.height / 2);
      ctx.restore();

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else canvas.toBlob(resolve, 'image/jpeg', 0.92);
          },
          'image/webp',
          0.92,
        ),
      );

      if (!blob) throw new Error('Não foi possível gerar a imagem recortada.');

      const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
      const baseName = fileName.replace(/\.[^.]+$/, '') || 'avatar';
      const croppedFile = new File([blob], `${baseName}-crop.${ext}`, {
        type: blob.type,
      });

      await onConfirm(croppedFile);
    } finally {
      setIsExporting(false);
    }
  };

  const busy = isUploading || isExporting;
  const baseScale = imgSize ? getBaseScale(imgSize, rotation, stageSize) : 1;
  const displayWidth = imgSize ? imgSize.width * baseScale : stageSize;
  const displayHeight = imgSize ? imgSize.height * baseScale : stageSize;

  return (
    <Modal
      isOpen={isOpen}
      onClose={busy ? () => {} : onClose}
      title="Enquadrar foto de perfil"
      description="Arraste e ajuste o zoom para deixar sua foto centralizada."
      size="md"
      hideCloseButton={busy}
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={busy}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmCrop}
            isLoading={busy}
            disabled={!imgSize}
            leftIcon={<FontAwesomeIcon icon={faCheck} />}
            className="w-full sm:w-auto"
          >
            {isUploading ? 'Enviando foto...' : 'Confirmar foto'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {/* Palco interativo de recorte */}
        <div className="flex flex-col items-center">
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onWheel={handleWheel}
            className={`relative w-[212px] h-[212px] sm:w-[224px] sm:h-[224px] xl:w-[256px] xl:h-[256px] rounded-2xl overflow-hidden bg-neutral-950 border border-border-strong select-none touch-none ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            aria-label="Área de enquadramento da foto de perfil"
          >
            {imageSrc && (
              <img
                src={imageSrc}
                alt="Pré-visualização para recorte"
                onLoad={handleImageLoad}
                draggable={false}
                style={{
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                }}
                className="absolute top-1/2 left-1/2 max-w-none pointer-events-none origin-center will-change-transform"
              />
            )}

            {/* Máscara circular + guia visual */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="w-full h-full rounded-full ring-2 ring-white/90"
                style={{ boxShadow: '0 0 0 9999px rgba(3, 7, 18, 0.58)' }}
              />
            </div>

            {/* Grade suave ao arrastar */}
            <div
              className={`pointer-events-none absolute inset-0 transition-opacity duration-150 ${
                isDragging ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-x-0 top-1/3 h-px bg-white/30" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-white/30" />
              <div className="absolute inset-y-0 left-1/3 w-px bg-white/30" />
              <div className="absolute inset-y-0 left-2/3 w-px bg-white/30" />
            </div>
          </div>

          <p className="mt-2 text-xs text-text-muted flex items-center gap-1.5">
            <FontAwesomeIcon icon={faUpDownLeftRight} className="w-3 h-3 text-text-subtle" />
            Arraste a imagem para ajustar a posição
          </p>
        </div>

        {/* Controle de Zoom */}
        <div className="bg-surface-sunken/70 border border-border rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-text-main">Zoom</span>
            <span className="font-mono text-text-muted">{Math.round(zoom * 100)}%</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => updateZoom(zoom - 0.15)}
              disabled={busy || zoom <= MIN_ZOOM}
              className="w-8 h-8 rounded-lg border border-border bg-surface text-text-muted hover:text-text-main hover:bg-surface-hover disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Diminuir zoom"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassMinus} className="w-3.5 h-3.5" />
            </button>

            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.02}
              value={zoom}
              onChange={(e) => updateZoom(parseFloat(e.target.value))}
              disabled={busy || !imgSize}
              aria-label="Ajustar zoom da foto"
              className="flex-1 h-2 rounded-full accent-primary bg-border-strong cursor-pointer"
            />

            <button
              type="button"
              onClick={() => updateZoom(zoom + 0.15)}
              disabled={busy || zoom >= MAX_ZOOM}
              className="w-8 h-8 rounded-lg border border-border bg-surface text-text-muted hover:text-text-main hover:bg-surface-hover disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Aumentar zoom"
            >
              <FontAwesomeIcon icon={faMagnifyingGlassPlus} className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Ações rápidas */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-border/70">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                disabled={busy || !imgSize}
                leftIcon={<FontAwesomeIcon icon={faRotateRight} className="w-3.5 h-3.5" />}
                className="!h-8 !px-2.5 text-xs"
              >
                Girar
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={busy || (zoom === 1 && rotation === 0 && offset.x === 0 && offset.y === 0)}
                leftIcon={<FontAwesomeIcon icon={faArrowsToDot} className="w-3.5 h-3.5" />}
                className="!h-8 !px-2.5 text-xs"
              >
                Centralizar
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onChangeFile}
              disabled={busy}
              leftIcon={<FontAwesomeIcon icon={faImage} className="w-3.5 h-3.5" />}
              className="!h-8 !px-2.5 text-xs"
            >
              Trocar foto
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
