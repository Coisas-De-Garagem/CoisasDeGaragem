import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Alert } from '@/components/common/Alert';
import type { Product, CreateProductRequest, UpdateProductRequest, ProductCondition } from '@/types';

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const conditionOptions = [
  { value: 'NEW', label: 'Novo' },
  { value: 'LIKE_NEW', label: 'Como Novo' },
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
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!name.trim()) {
      setError('Nome do produto é obrigatório');
      return;
    }
    if (name.length < 3) {
      setError('Nome deve ter no mínimo 3 caracteres');
      return;
    }
    if (!description.trim()) {
      setError('Descrição é obrigatória');
      return;
    }
    if (description.length < 10) {
      setError('Descrição deve ter no mínimo 10 caracteres');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      setError('Preço deve ser maior que zero');
      return;
    }

    try {
      const data: CreateProductRequest | UpdateProductRequest = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        currency: 'BRL',
        imageUrl: imageUrl.trim() || undefined,
        category: category || undefined,
        condition: condition,
      };

      if (product) {
        // It's an update - add isAvailable
        (data as UpdateProductRequest).isAvailable = product.isAvailable;
      }

      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar produto');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      <Input
        id="name"
        type="text"
        label="Nome do produto *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex: Bicicleta infantil"
        required
        fullWidth
        disabled={isLoading}
        maxLength={200}
        helperText={`${name.length}/200 caracteres`}
      />

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descrição *
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o produto, suas características, estado, etc."
          required
          disabled={isLoading}
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 placeholder-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          aria-describedby="description-helper"
        />
        <p id="description-helper" className="mt-1 text-sm text-gray-500">
          {description.length}/2000 caracteres
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="price"
          type="number"
          label="Preço (BRL) *"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          required
          fullWidth
          disabled={isLoading}
          min="0"
          step="0.01"
          helperText="Valor em reais"
        />

        <Select
          id="category"
          label="Categoria"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          options={categoryOptions}
          fullWidth
          disabled={isLoading}
          helperText="Opcional"
        />
      </div>

      <Select
        id="condition"
        label="Condição *"
        value={condition}
        onChange={(e) => setCondition(e.target.value as ProductCondition)}
        options={conditionOptions}
        fullWidth
        disabled={isLoading}
        required
      />

      <Input
        id="imageUrl"
        type="url"
        label="URL da imagem"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://exemplo.com/imagem.jpg"
        fullWidth
        disabled={isLoading}
        helperText="Opcional - URL da imagem do produto"
      />

      {imageUrl && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pré-visualização
          </label>
          <div className="relative h-48 w-full sm:w-48 rounded-lg border border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Pré-visualização do produto"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Erro+na+Imagem';
              }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-4 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="tertiary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {product ? 'Atualizar Produto' : 'Criar Produto'}
        </Button>
      </div>
    </form>
  );
}
