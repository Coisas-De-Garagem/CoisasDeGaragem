import { useState } from 'react';
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
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || '');
  const [locationId, setLocationId] = useState(product?.locationId || '');
  
  const { addNotification } = useUIStore();
  const notify = makeNotifier(addNotification);

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
        imageUrl: imageUrl.trim() || undefined,
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
    <form onSubmit={handleSubmit} className="space-y-5">

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
        <LocationSelect
          value={locationId}
          onChange={setLocationId}
        />
        <p className="text-xs text-text-muted mt-1">Onde este produto estará disponível</p>
      </div>

      <Input
        id="imageUrl"
        name="imageUrl"
        type="url"
        label="URL da imagem"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://exemplo.com/imagem.jpg"
        fullWidth
        disabled={isLoading}
        helperText="Opcional — URL da imagem do produto"
      />

      {imageUrl && (
        <div>
          <p className="text-sm font-medium text-text-main mb-1.5">Pré-visualização</p>
          <div className="relative h-40 w-full sm:w-48 rounded-lg border border-border overflow-hidden bg-surface-sunken flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Pré-visualização do produto"
              className="h-full w-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement!.innerHTML =
                  '<div class="flex flex-col items-center text-text-subtle"><svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5z"/></svg></div>';
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-1">
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
