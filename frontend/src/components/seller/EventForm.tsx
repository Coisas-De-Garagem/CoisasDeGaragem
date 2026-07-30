import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import type { GarageEvent, EventStatus, CreateEventRequest, UpdateEventRequest } from '@/types';
import { EVENT_STATUS_OPTIONS } from '@/pages/seller/events/eventHelpers';

interface EventFormProps {
  event?: GarageEvent;
  onSubmit: (data: CreateEventRequest | UpdateEventRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function EventForm({ event, onSubmit, onCancel, isLoading }: EventFormProps) {
  const [name, setName] = useState(event?.name || '');
  const [description, setDescription] = useState(event?.description || '');
  const [status, setStatus] = useState<EventStatus>(event?.status || 'DRAFT');
  const [startDate, setStartDate] = useState<Dayjs | null>(event?.startDate ? dayjs(event.startDate) : null);
  const [endDate, setEndDate] = useState<Dayjs | null>(event?.endDate ? dayjs(event.endDate) : null);
  const [street, setStreet] = useState(event?.street || '');
  const [number, setNumber] = useState(event?.number || '');
  const [district, setDistrict] = useState(event?.district || '');
  const [city, setCity] = useState(event?.city || '');
  const [zipCode, setZipCode] = useState(event?.zipCode || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do evento é obrigatório');
      return;
    }
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        status,
        startDate: startDate ? startDate.toISOString() : undefined,
        endDate: endDate ? endDate.toISOString() : undefined,
        street: street.trim() || undefined,
        number: number.trim() || undefined,
        district: district.trim() || undefined,
        city: city.trim() || undefined,
        zipCode: zipCode.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar evento');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        id="name"
        name="name"
        label="Nome do evento"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ex.: Brechó de Verão"
        required
        fullWidth
        disabled={isLoading}
      />
      <Textarea
        id="description"
        name="description"
        label="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descreva o que os compradores vão encontrar..."
        rows={3}
        disabled={isLoading}
      />
      <div className="w-48">
        <Select
          id="status"
          name="status"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as EventStatus)}
          options={EVENT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5">Data de início</label>
          <DatePicker
            value={startDate}
            maxDate={endDate || undefined}
            onChange={(v: Dayjs | null) => setStartDate(v)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1.5">Data de fim</label>
          <DatePicker
            value={endDate}
            minDate={startDate || undefined}
            onChange={(v: Dayjs | null) => setEndDate(v)}
            slotProps={{ textField: { size: 'small' } }}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-text-main mb-3">Local do garage sale</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-4">
          <Input
            id="street"
            name="street"
            label="Rua"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Rua das Flores"
            fullWidth
            disabled={isLoading}
          />
          <Input
            id="number"
            name="number"
            label="Número"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            placeholder="123"
            fullWidth
            disabled={isLoading}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="district"
            name="district"
            label="Bairro"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            placeholder="Centro"
            fullWidth
            disabled={isLoading}
          />
          <Input
            id="city"
            name="city"
            label="Cidade"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="São Paulo"
            fullWidth
            disabled={isLoading}
          />
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="zipCode"
            name="zipCode"
            label="CEP"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="01000-000"
            fullWidth
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-error font-medium" role="alert">{error}</p>
      )}

      <div className="flex gap-3 justify-end pt-1">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" isLoading={isLoading}>
          {event ? 'Salvar alterações' : 'Criar evento'}
        </Button>
      </div>
    </form>
  );
}
