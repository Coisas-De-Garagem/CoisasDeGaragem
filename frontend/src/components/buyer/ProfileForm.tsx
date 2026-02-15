import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import type { User } from '@/types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface ProfileFormProps {
  user: User;
  onSubmit: (data: { name?: string; phone?: string; avatarUrl?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function ProfileForm({ user, onSubmit, isLoading }: ProfileFormProps) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!name.trim()) {
      setError('Nome é obrigatório');
      return;
    }
    if (name.length < 2) {
      setError('Nome deve ter no mínimo 2 caracteres');
      return;
    }
    if (name.length > 100) {
      setError('Nome deve ter no máximo 100 caracteres');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar perfil');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Avatar Section */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <Input
            id="avatarUrl"
            type="url"
            label="URL da foto de perfil"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://exemplo.com/foto.jpg"
            fullWidth
            disabled={isLoading}
            helperText="Opcional - Deixe vazio para manter a foto atual"
          />
        </div>
      </div>

      <Input
        id="name"
        type="text"
        label="Nome completo *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome completo"
        required
        fullWidth
        disabled={isLoading}
        maxLength={100}
        helperText={`${name.length}/100 caracteres`}
      />

      <Input
        id="phone"
        type="tel"
        label="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="(11) 98765-4321"
        fullWidth
        disabled={isLoading}
        helperText="Opcional - Formato: (11) 98765-4321"
      />

      <div className="flex gap-4 justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          Salvar Perfil
        </Button>
      </div>
    </form>
  );
}
