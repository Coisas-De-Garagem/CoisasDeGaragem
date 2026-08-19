import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera,
  faPlus,
  faTrashCan,
  faStar,
  faArrowLeft,
  faArrowRight,
  faLink,
  faImages,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
import { LocationSelect } from '@/components/seller/LocationSelect';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductCondition } from '@/types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const MAX_IMAGES = 8;
const MAX_FILE_SIZE_MB = 10;

const conditionOptions = [
  { value: 'NEW', label: 'Novo' },
  { value: 'LIKE_NEW', label: 'Como novo' },
  { value: 'GOOD', label: 'Bom' },
  { value: 'FAIR', label: 'Razoável' },
  { value: 'POOR', label: 'Ruim' },
];

const categoryOptions = [
  { value: 'Brinquedos', label: 'Brinquedos' },
  { value: 'Eletrônicos', label: 'Eletrônicos' },
  { value: 'Móveis', label: 'Móveis' },
  { value: 'Roupas', label: 'Roupas' },
  { value: 'Livros', label: 'Livros' },
  { value: 'Ferramentas', label: 'Ferramentas' },
  { value: 'Esportes', label: 'Esportes' },
  { value: 'Outros', label: 'Outros' },
];

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price?.toString() || '');
  const [category, setCategory] = useState(product?.category || '');
  const [condition, setCondition] = useState<ProductCondition>(product?.condition || 'GOOD');
  const [locationId, setLocationId] = useState(product?.locationId || '');

  // Multi-image state
  const initialImages = (
    product?.images && product.images.length > 0
      ? product.images
      : product?.imageUrl
        ? [product.imageUrl]
        : []
  ).filter((img): img is string => Boolean(img && img.trim().length > 0));

  const [images, setImages] = useState<string[]>(initialImages);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useUIStore();
  const notify = makeNotifier(addNotification);

  // File upload handler (from camera or gallery)
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (!fileArray.length) return;

    if (images.length + fileArray.length > MAX_IMAGES) {
      notify(
        'warning',
        'Limite de imagens',
        `Você pode adicionar no máximo ${MAX_IMAGES} fotos por produto.`,
      );
    }

    const availableSlots = MAX_IMAGES - images.length;
    const filesToProcess = fileArray.slice(0, Math.max(0, availableSlots));

    if (!filesToProcess.length) return;

    setIsProcessingFiles(true);
    const newLoadedImages: string[] = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        notify('error', 'Arquivo inválido', `"${file.name}" não é uma imagem válida.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        notify(
          'error',
          'Arquivo muito pesado',
          `"${file.name}" excede o tamanho máximo de ${MAX_FILE_SIZE_MB}MB.`,
        );
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        newLoadedImages.push(base64);
      } catch (err) {
        console.error('Error reading file:', err);
        notify('error', 'Erro ao ler arquivo', `Não foi possível carregar "${file.name}".`);
      }
    }

    if (newLoadedImages.length > 0) {
      setImages((prev) => [...prev, ...newLoadedImages]);
      notify(
        'success',
        'Fotos adicionadas',
        `${newLoadedImages.length} ${newLoadedImages.length === 1 ? 'foto adicionada' : 'fotos adicionadas'} com sucesso.`,
      );
    }

    setIsProcessingFiles(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (images.length >= MAX_IMAGES) {
      notify('warning', 'Limite atingido', `Máximo de ${MAX_IMAGES} fotos permitido.`);
      return;
    }

    // Basic URL validation
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
      notify('warning', 'URL inválida', 'A URL da imagem deve começar com http://, https:// ou /');
      return;
    }

    setImages((prev) => [...prev, trimmed]);
    setUrlInput('');
    notify('success', 'Imagem adicionada', 'URL da foto vinculada.');
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetAsCover = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.unshift(item);
      return copy;
    });
    notify('info', 'Capa atualizada', 'Esta imagem agora é a capa principal do produto.');
  };

  const handleMoveImage = (fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= images.length) return;

    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[fromIndex];
      copy[fromIndex] = copy[toIndex];
      copy[toIndex] = temp;
      return copy;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return notify('warning', 'Atenção', 'Nome do produto é obrigatório');
    if (name.length < 3) return notify('warning', 'Atenção', 'Nome deve ter no mínimo 3 caracteres');
    if (!description.trim()) return notify('warning', 'Atenção', 'Descrição é obrigatória');
    if (description.length < 10) return notify('warning', 'Atenção', 'Descrição deve ter no mínimo 10 caracteres');
    if (!price || parseFloat(price) <= 0) return notify('warning', 'Atenção', 'Preço deve ser maior que zero');
    if (!locationId) return notify('warning', 'Atenção', 'Por favor, selecione um local para o produto');

    try {
      const data: CreateProductRequest | UpdateProductRequest = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        currency: 'BRL',
        images: images,
        imageUrl: images.length > 0 ? images[0] : undefined,
        category: category || undefined,
        condition,
        locationId,
      };

      if (product) {
        (data as UpdateProductRequest).isAvailable = product.isAvailable;
      }

      await onSubmit(data);
    } catch (err) {
      notify('error', 'Erro', err instanceof Error ? err.message : 'Erro ao salvar produto');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="name"
        name="name"
        type="text"
        label="Nome do produto"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Bicicleta infantil"
        required
        fullWidth
        disabled={isLoading}
        maxLength={200}
        helperText={`${name.length}/200 caracteres`}
      />

      <Textarea
        id="description"
        name="description"
        label="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descreva o produto, suas características, estado, etc."
        required
        disabled={isLoading}
        rows={4}
        maxLength={2000}
        helperText={`${description.length}/2000 caracteres`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="price"
          name="price"
          type="number"
          label="Preço"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0,00"
          required
          fullWidth
          disabled={isLoading}
          min="0"
          step="0.01"
          rightAddon="R$"
          helperText="Valor em reais"
        />

        <Select
          id="category"
          name="category"
          label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
          fullWidth
          disabled={isLoading}
          placeholder="Selecione"
          helperText="Opcional"
        />
      </div>

      <Select
        id="condition"
        name="condition"
        label="Condição"
        value={condition}
        onChange={(e) => setCondition(e.target.value as ProductCondition)}
        options={conditionOptions}
        fullWidth
        disabled={isLoading}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-text-main mb-1">
          Local do Garage Sale *
        </label>
        <LocationSelect value={locationId} onChange={setLocationId} />
        <p className="text-xs text-text-muted mt-1">Onde este produto estará disponível</p>
      </div>

      {/* Seção de Fotos do Produto (Multi-Imagens Otimizada para Mobile e Desktop) */}
      <div className="space-y-3 pt-2 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div>
            <label className="block text-sm font-semibold text-text-main flex items-center gap-2">
              <FontAwesomeIcon icon={faImages} className="text-primary" />
              Fotos do produto
            </label>
            <p className="text-xs text-text-muted">
              Adicione fotos para atrair compradores. A primeira foto será a capa.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-sunken border border-border text-text-muted self-start sm:self-auto">
            {images.length} de {MAX_IMAGES} fotos
          </span>
        </div>

        {/* Input Oculto de Arquivos */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isLoading || isProcessingFiles || images.length >= MAX_IMAGES}
        />

        {/* Botoeira Principal de Adicionar Fotos */}
        {images.length < MAX_IMAGES && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-all ${
              isDragOver
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-border-strong hover:border-primary/60 bg-surface-sunken/40'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <FontAwesomeIcon icon={faCamera} className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-main">
                  Tire fotos com a câmera ou escolha da galeria
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Formatos aceitos: JPG, PNG, WEBP (até {MAX_FILE_SIZE_MB}MB por foto)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 w-full max-w-sm">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  className="flex-1 min-w-[140px]"
                  leftIcon={<FontAwesomeIcon icon={faCamera} />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isProcessingFiles}
                  isLoading={isProcessingFiles}
                >
                  Selecionar fotos
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="flex-1 min-w-[140px]"
                  leftIcon={<FontAwesomeIcon icon={faLink} />}
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  disabled={isLoading || isProcessingFiles}
                >
                  {showUrlInput ? 'Ocultar URL' : 'Adicionar via URL'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Campo Opcional de Adicionar por URL */}
        {showUrlInput && images.length < MAX_IMAGES && (
          <div className="p-3 bg-surface rounded-lg border border-border flex flex-col sm:flex-row gap-2 items-stretch">
            <div className="flex-1">
              <input
                type="url"
                placeholder="Cole a URL da imagem (https://exemplo.com/foto.jpg)"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddUrl();
                  }
                }}
                className="w-full bg-surface-sunken border border-border-strong rounded-lg px-3 py-2 text-sm text-text-main placeholder:text-text-subtle focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddUrl}
              leftIcon={<FontAwesomeIcon icon={faPlus} />}
              disabled={!urlInput.trim()}
            >
              Adicionar
            </Button>
          </div>
        )}

        {/* Grade de Imagens Anexadas */}
        {images.length > 0 && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => {
                const isCover = idx === 0;
                return (
                  <div
                    key={idx}
                    className={`relative group rounded-xl overflow-hidden border-2 bg-surface-sunken aspect-square transition-all shadow-sm ${
                      isCover
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-border-strong'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Foto do produto ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.classList.add(
                          'flex',
                          'items-center',
                          'justify-center',
                          'text-error',
                        );
                      }}
                    />

                    {/* Badge de Capa */}
                    {isCover && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-primary text-white shadow-md">
                          <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-amber-300" />
                          Capa
                        </span>
                      </div>
                    )}

                    {/* Controles de Ação da Imagem (Otimizados para Touch) */}
                    <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[2px] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                      {/* Top Action: Delete */}
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="w-8 h-8 rounded-full bg-error/90 hover:bg-error text-white flex items-center justify-center transition-transform active:scale-90 shadow-md cursor-pointer"
                          title="Remover foto"
                          aria-label="Remover foto"
                        >
                          <FontAwesomeIcon icon={faTrashCan} className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Actions: Reorder and Set as Cover */}
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex gap-1">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'left')}
                              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-90 cursor-pointer"
                              title="Mover para esquerda"
                              aria-label="Mover foto para a esquerda"
                            >
                              <FontAwesomeIcon icon={faArrowLeft} className="w-3 h-3" />
                            </button>
                          )}
                          {idx < images.length - 1 && (
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'right')}
                              className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-90 cursor-pointer"
                              title="Mover para direita"
                              aria-label="Mover foto para a direita"
                            >
                              <FontAwesomeIcon icon={faArrowRight} className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetAsCover(idx)}
                            className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium flex items-center gap-1 active:scale-95 cursor-pointer"
                            title="Definir como foto principal"
                          >
                            <FontAwesomeIcon icon={faStar} className="w-2.5 h-2.5 text-amber-300" />
                            Tornar capa
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-text-muted flex items-center gap-1.5 pt-1">
              <FontAwesomeIcon icon={faCircleExclamation} className="text-text-subtle" />
              Dica: A foto marcada como "Capa" é exibida nas vitrines e buscas. Toque em "Tornar capa" para alterá-la.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-3 border-t border-border">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {product ? 'Atualizar produto' : 'Criar produto'}
        </Button>
      </div>
    </form>
  );
}

