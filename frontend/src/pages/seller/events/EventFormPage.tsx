import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { useEvents } from '@/hooks/useEvents';
import type { EventStatus } from '@/types';
import { EVENT_STATUS_OPTIONS } from './eventHelpers';

export default function EventFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const { createEvent, editEvent, fetchEvent } = useEvents();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<EventStatus>('DRAFT');
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEdit);
  const [error, setError] = useState('');

  // Carrega dados para edição
  useEffect(() => {
    if (!isEdit || !id) return;
    const load = async () => {
      try {
        const event = await fetchEvent(id);
        setName(event.name);
        setDescription(event.description || '');
        setStatus(event.status);
        setStartDate(event.startDate ? dayjs(event.startDate) : null);
        setEndDate(event.endDate ? dayjs(event.endDate) : null);
        setStreet(event.street || '');
        setNumber(event.number || '');
        setDistrict(event.district || '');
        setCity(event.city || '');
        setZipCode(event.zipCode || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar evento');
      } finally {
        setPageLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do evento é obrigatório');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
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
      };
      if (isEdit && id) {
        await editEvent(id, payload);
      } else {
        await createEvent(payload);
      }
      navigate('/seller/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-primary">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/seller/events')}
          leftIcon={<FontAwesomeIcon icon={faArrowLeft} />}
        >
          Voltar para eventos
        </Button>
      </div>

      <h1 className="text-2xl lg:text-3xl font-bold text-text-main mb-1">
        {isEdit ? 'Editar evento' : 'Novo evento'}
      </h1>
      <p className="text-text-muted mb-6">
        {isEdit
          ? 'Atualize as informações do seu garage sale.'
          : 'Crie um garage sale para organizar e vender seus produtos.'}
      </p>

      {error && (
        <div className="mb-4">
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações básicas */}
        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-main">Informações do evento</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            <Input
              id="name"
              name="name"
              label="Nome do evento"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Brechó de Verão"
              required
              fullWidth
              disabled={loading}
            />
            <Textarea
              id="description"
              name="description"
              label="Descrição"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que os compradores vão encontrar..."
              rows={3}
              disabled={loading}
            />
            <div className="w-48">
              <Select
                id="status"
                name="status"
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as EventStatus)}
                options={EVENT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">
                  Data de início
                </label>
                <DatePicker
                  value={startDate}
                  maxDate={endDate || undefined}
                  onChange={(v: Dayjs | null) => setStartDate(v)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-main mb-1.5">
                  Data de fim
                </label>
                <DatePicker
                  value={endDate}
                  minDate={startDate || undefined}
                  onChange={(v: Dayjs | null) => setEndDate(v)}
                  slotProps={{ textField: { size: 'small' } }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Endereço */}
        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-main">Local do garage sale</h2>
            <p className="text-sm text-text-muted mt-0.5">Onde o evento vai acontecer (opcional).</p>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-4">
              <Input
                id="street"
                name="street"
                label="Rua"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Rua das Flores"
                fullWidth
                disabled={loading}
              />
              <Input
                id="number"
                name="number"
                label="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="123"
                fullWidth
                disabled={loading}
              />
            </div>
            <Input
              id="district"
              name="district"
              label="Bairro"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Centro"
              fullWidth
              disabled={loading}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="city"
                name="city"
                label="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="São Paulo"
                fullWidth
                disabled={loading}
              />
              <Input
                id="zipCode"
                name="zipCode"
                label="CEP"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="01000-000"
                fullWidth
                disabled={loading}
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/seller/events')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={loading}>
            {isEdit ? 'Salvar alterações' : 'Criar evento'}
          </Button>
        </div>
      </form>
    </div>
  );
}
