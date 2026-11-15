import { uploadImage } from '@/services/media';
import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
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
  const [uploading, setUploading] = useState(false);
  const { addNotification } = useUIStore();
  const notify = makeNotifier(addNotification);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) return;
    if (!name.trim()) {
      notify('warning', 'Atenção', 'Nome é obrigatório');
      return;
    }
    if (name.length < 2) {
      notify('warning', 'Atenção', 'Nome deve ter no mínimo 2 caracteres');
      return;
    }
    if (name.length > 100) {
      notify('warning', 'Atenção', 'Nome deve ter no máximo 100 caracteres');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
      });
    } catch (err) {
      notify('error', 'Erro', err instanceof Error ? err.message : 'Erro ao salvar perfil');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="px-5 py-5 space-y-5">

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar name={name || user.name} src={avatarUrl} size="xl" />
        <div className="flex-1">
          <label className="block text-sm">
            Foto de perfil
            <input type="file" accept="image/jpeg,image/png,image/webp"
              disabled={isLoading || uploading} className="mt-2 block w-full"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (file.size > 10 * 1024 * 1024) {
                  notify('error', 'Foto muito grande', 'O limite é de 10 MB.');
                  event.target.value = '';
                  return;
                }
                setUploading(true);
                try { setAvatarUrl(await uploadImage(file)); }
                catch (error) { notify('error', 'Erro ao enviar foto', error instanceof Error ? error.message : 'Tente novamente.'); }
                finally { setUploading(false); }
              }} />
            {uploading && <span>Enviando foto...</span>}
          </label>
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
        <Button type="submit" variant="primary" isLoading={isLoading || uploading}>
          Salvar perfil
        </Button>
      </div>
    </form>
  );
}
