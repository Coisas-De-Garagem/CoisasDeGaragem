import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCamera,
  faCloudArrowUp,
  faTrashCan,
  faUser,
  faPhone,
  faCheck,
  faRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import { uploadImage } from '@/services/media';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { AvatarCropModal } from '@/components/buyer/AvatarCropModal';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
import type { User } from '@/types';

interface ProfileFormProps {
  user: User;
  onSubmit: (data: { name?: string; phone?: string; avatarUrl?: string }) => Promise<void>;
  isLoading?: boolean;
}

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function ProfileForm({ user, onSubmit, isLoading }: ProfileFormProps) {
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Estado do modal de recorte/enquadramento
  const [pendingImageSrc, setPendingImageSrc] = useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = useState<string>('avatar.webp');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useUIStore();
  const notify = makeNotifier(addNotification);

  // Libera ObjectURL ao desmontar ou trocar a imagem pendente.
  useEffect(() => {
    return () => {
      if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    };
  }, [pendingImageSrc]);

  const hasChanges =
    name.trim() !== (user.name || '').trim() ||
    phone.trim() !== (user.phone || '').trim() ||
    avatarUrl.trim() !== (user.avatarUrl || '').trim();

  const openFilePicker = () => {
    if (isLoading || uploading) return;
    fileInputRef.current?.click();
  };

  const handleSelectedFile = (file?: File) => {
    if (!file) return;

    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      notify('error', 'Formato inválido', 'Escolha uma imagem JPG, PNG ou WebP.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      notify('error', 'Foto muito grande', 'O limite é de 10 MB.');
      return;
    }

    if (pendingImageSrc) URL.revokeObjectURL(pendingImageSrc);
    setPendingFileName(file.name);
    setPendingImageSrc(URL.createObjectURL(file));
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    handleSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isLoading || uploading) return;
    handleSelectedFile(e.dataTransfer.files?.[0]);
  };

  const handleConfirmCrop = async (croppedFile: File) => {
    setUploading(true);
    try {
      const uploadedUrl = await uploadImage(croppedFile);
      setAvatarUrl(uploadedUrl);
      setPendingImageSrc(null);
      notify(
        'success',
        'Foto pronta',
        'Foto enquadrada e enviada. Clique em "Salvar alterações" para aplicar.',
      );
    } catch (error) {
      notify(
        'error',
        'Erro ao enviar foto',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
  };

  const handleDiscard = () => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setAvatarUrl(user.avatarUrl || '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) return;
    if (!name.trim()) {
      notify('warning', 'Atenção', 'Nome é obrigatório');
      return;
    }
    if (name.trim().length < 2) {
      notify('warning', 'Atenção', 'Nome deve ter no mínimo 2 caracteres');
      return;
    }
    if (name.trim().length > 100) {
      notify('warning', 'Atenção', 'Nome deve ter no máximo 100 caracteres');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        avatarUrl: avatarUrl.trim(),
      });
    } catch (err) {
      notify('error', 'Erro', err instanceof Error ? err.message : 'Erro ao salvar perfil');
    }
  };

  const avatarChanged = avatarUrl.trim() !== (user.avatarUrl || '').trim();

  return (
    <>
      <form onSubmit={handleSubmit} className="divide-y divide-border">
        {/* Seção: Foto de perfil */}
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="text-base font-semibold text-text-main">Foto de perfil</h2>
              <p className="text-xs sm:text-sm text-text-muted">
                Escolha uma foto e ajuste o enquadramento antes de salvar.
              </p>
            </div>
            {avatarChanged && (
              <Badge variant="info" className="shrink-0">
                Não salva
              </Badge>
            )}
          </div>

          {/* Input nativo oculto */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isLoading || uploading}
            onChange={handleFileInputChange}
            className="sr-only"
            aria-label="Selecionar foto de perfil"
          />

          {/* Dropzone + Preview do Avatar */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              if (!isLoading && !uploading) setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-4 sm:p-5 transition-all ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border-strong/80 bg-surface-sunken/50 hover:border-primary/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              {/* Avatar clicável com botão de câmera */}
              <div className="relative group shrink-0">
                <button
                  type="button"
                  onClick={openFilePicker}
                  disabled={isLoading || uploading}
                  className="relative rounded-full focus-visible:outline-2 focus-visible:outline-primary cursor-pointer disabled:opacity-60"
                  title="Alterar foto de perfil"
                  aria-label="Alterar foto de perfil"
                >
                  <Avatar
                    name={name || user.name}
                    src={avatarUrl || undefined}
                    size="xl"
                    className="!w-20 !h-20 sm:!w-24 sm:!h-24 ring-4 ring-surface shadow-sm"
                  />
                  <span className="absolute inset-0 rounded-full bg-neutral-950/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <FontAwesomeIcon icon={faCamera} className="w-5 h-5" />
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-8 h-8 rounded-full bg-primary text-white border-2 border-surface shadow-md flex items-center justify-center group-hover:bg-primary-hover transition-colors">
                    <FontAwesomeIcon icon={faCamera} className="w-3.5 h-3.5" />
                  </span>
                </button>
              </div>

              {/* Ações e instruções */}
              <div className="flex-1 min-w-0 text-center sm:text-left space-y-2.5">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-text-main">
                    {isDragOver
                      ? 'Solte a imagem aqui para enquadrar'
                      : 'Clique para selecionar ou arraste uma foto aqui'}
                  </p>
                  <p className="text-xs text-text-muted">
                    Formatos aceitos: JPG, PNG ou WebP · Tamanho máximo de 10 MB
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openFilePicker}
                    disabled={isLoading || uploading}
                    isLoading={uploading}
                    leftIcon={<FontAwesomeIcon icon={faCloudArrowUp} />}
                  >
                    {avatarUrl ? 'Alterar foto' : 'Escolher foto'}
                  </Button>

                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={isLoading || uploading}
                      leftIcon={<FontAwesomeIcon icon={faTrashCan} />}
                      className="text-error hover:text-error hover:bg-error/10"
                    >
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção: Dados pessoais */}
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <h2 className="text-base font-semibold text-text-main">Dados pessoais</h2>
            <p className="text-xs sm:text-sm text-text-muted">
              Essas informações aparecem nos seus anúncios e compras.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              leftIcon={<FontAwesomeIcon icon={faUser} className="w-4 h-4" />}
              helperText={`${name.length}/100 caracteres`}
            />

            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Telefone"
              value={phone}
              onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
              placeholder="(11) 98765-4321"
              fullWidth
              disabled={isLoading}
              maxLength={15}
              leftIcon={<FontAwesomeIcon icon={faPhone} className="w-4 h-4" />}
              helperText="Opcional · usado para contato em vendas"
            />
          </div>
        </div>

        {/* Rodapé de ações */}
        <div className="px-4 sm:px-6 py-4 bg-surface-sunken/40 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-text-muted text-center sm:text-left">
            {hasChanges
              ? 'Você tem alterações pendentes neste perfil.'
              : 'Todas as informações estão atualizadas.'}
          </p>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
            {hasChanges && (
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={handleDiscard}
                disabled={isLoading || uploading}
                leftIcon={<FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />}
              >
                Descartar
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!hasChanges || uploading}
              isLoading={isLoading || uploading}
              leftIcon={<FontAwesomeIcon icon={faCheck} />}
            >
              Salvar alterações
            </Button>
          </div>
        </div>
      </form>

      {/* Modal de confirmação e enquadramento da foto */}
      <AvatarCropModal
        key={pendingImageSrc || 'closed'}
        isOpen={Boolean(pendingImageSrc)}
        imageSrc={pendingImageSrc}
        fileName={pendingFileName}
        isUploading={uploading}
        onClose={() => setPendingImageSrc(null)}
        onChangeFile={openFilePicker}
        onConfirm={handleConfirmCrop}
      />
    </>
  );
}
