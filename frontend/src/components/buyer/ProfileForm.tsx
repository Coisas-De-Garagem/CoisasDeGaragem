import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { Avatar } from '@/components/common/Avatar';
import type { User } from '@/types';

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
    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">
      {error && (
        <Alert variant="error" dismissible onDismiss={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar name={name || user.name} src={avatarUrl} size="xl" />
        <div className="flex-1">
          <Input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            label="URL da foto de perfil"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://exemplo.com/foto.jpg"
            fullWidth
            disabled={isLoading}
            helperText="Opcional — deixe vazio para usar as iniciais"
          />
        </div>
      </div>

      <Input
        id="name"
        name="name"
        type="text"
        label="Nome completo"
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
        name="phone"
        type="tel"
        label="Telefone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="(11) 98765-4321"
        fullWidth
        disabled={isLoading}
        helperText="Opcional — formato: (11) 98765-4321"
      />

      <div className="flex justify-end pt-1">
        <Button type="submit" variant="primary" isLoading={isLoading}>
          Salvar perfil
        </Button>
      </div>
    </form>
  );
}
