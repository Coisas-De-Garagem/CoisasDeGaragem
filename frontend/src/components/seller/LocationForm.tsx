import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocations } from '@/hooks/useLocations';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
import type { Location } from '@/types';

const locationSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  address: z.string().min(5, 'O endereço deve ter pelo menos 5 caracteres'),
  isActive: z.boolean(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  location?: Location;
  onSuccess: () => void;
  onCancel: () => void;
}

export function LocationForm({ location, onSuccess, onCancel }: LocationFormProps) {
  const { createLocation, editLocation } = useLocations({ autoFetch: false });
  const { addNotification } = useUIStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const notify = makeNotifier(addNotification);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name || '',
      address: location?.address || '',
      isActive: location ? location.isActive : true,
    },
  });

  const onSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      if (location) {
        await editLocation(location.id, data);
        notify('success', 'Sucesso', 'Local atualizado com sucesso!');
      } else {
        await createLocation(data);
        notify('success', 'Sucesso', 'Local criado com sucesso!');
      }
      onSuccess();
    } catch (error) {
      notify('error', 'Erro', error instanceof Error ? error.message : 'Erro ao salvar local');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium text-text-main">
          Nome do Local
        </label>
        <input
          id="name"
          {...register('name')}
          className={`w-full px-4 py-2 rounded-lg bg-surface border ${
            errors.name ? 'border-red-500' : 'border-border-strong focus:border-primary'
          } text-text-main focus:outline-none focus:ring-1 focus:ring-primary transition-colors`}
          placeholder="Ex: Garagem da minha casa"
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="space-y-1">
        <label htmlFor="address" className="block text-sm font-medium text-text-main">
          Endereço Completo
        </label>
        <input
          id="address"
          {...register('address')}
          className={`w-full px-4 py-2 rounded-lg bg-surface border ${
            errors.address ? 'border-red-500' : 'border-border-strong focus:border-primary'
          } text-text-main focus:outline-none focus:ring-1 focus:ring-primary transition-colors`}
          placeholder="Ex: Rua das Flores, 123 - Bairro Primavera"
        />
        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isActive"
          {...register('isActive')}
          className="w-4 h-4 text-primary bg-surface border-border-strong rounded focus:ring-primary focus:ring-2"
        />
        <label htmlFor="isActive" className="text-sm text-text-main cursor-pointer select-none">
          Local ativo (pode ser usado em novos produtos)
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {location ? 'Salvar Alterações' : 'Criar Local'}
        </Button>
      </div>
    </form>
  );
}
