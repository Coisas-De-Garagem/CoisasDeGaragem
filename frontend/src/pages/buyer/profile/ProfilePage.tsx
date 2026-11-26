import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserGear,
  faEnvelope,
  faIdBadge,
  faCalendarDay,
  faCircleCheck,
  faCircleXmark,
  faRightFromBracket,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { ProfileForm } from '@/components/buyer/ProfileForm';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/common/Spinner';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
import type { DashboardType } from '@/types';

interface ProfilePageProps {
  mode?: DashboardType;
}

export default function ProfilePage({ mode = 'buyer' }: ProfilePageProps) {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useUIStore();
  const notify = makeNotifier(addNotification);

  const handleSubmit = async (data: { name?: string; phone?: string; avatarUrl?: string }) => {
    setIsLoading(true);
    try {
      await updateProfile(data);
      notify('success', 'Sucesso', 'Perfil atualizado com sucesso!');
    } catch {
      notify('error', 'Erro', 'Erro ao atualizar perfil. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12 text-primary">
        <Spinner size="lg" />
      </div>
    );
  }

  const createdDate = new Date(user.createdAt).toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <FontAwesomeIcon icon={faUserGear} className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-text-main truncate">
            Configurações de Perfil
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            Gerencie sua foto, dados pessoais e detalhes da sua conta
          </p>
        </div>
      </div>

      {/* Layout responsivo: 1 coluna no mobile, 2 colunas equilibradas em notebooks e desktops */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Coluna principal: Foto e Dados Pessoais */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card flush>
            <ProfileForm
              key={`${user.id}-${user.updatedAt}`}
              user={user}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </Card>
        </div>

        {/* Coluna lateral: Resumo da conta + Sessão */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5">
          <Card flush>
            {/* Mini perfil de resumo */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center gap-3.5 bg-surface-sunken/40">
              <Avatar name={user.name} src={user.avatarUrl} size="lg" className="ring-2 ring-surface" />
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-semibold text-text-main truncate">
                  {user.name}
                </p>
                <p className="text-xs sm:text-sm text-text-muted truncate">{user.email}</p>
              </div>
              <Badge variant={user.isActive ? 'success' : 'error'} dot className="shrink-0">
                {user.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>

            {/* Metadados da conta */}
            <div className="divide-y divide-border">
              <InfoRow
                icon={<FontAwesomeIcon icon={faEnvelope} />}
                label="Email"
                value={<span className="break-all">{user.email}</span>}
              />
              <InfoRow
                icon={<FontAwesomeIcon icon={faIdBadge} />}
                label="Tipo de conta"
                value={
                  <Badge variant={user.role === 'admin' ? 'accent' : 'gray'}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                }
              />
              <InfoRow
                icon={<FontAwesomeIcon icon={faCalendarDay} />}
                label="Cadastrado em"
                value={createdDate}
              />
              <InfoRow
                icon={
                  <FontAwesomeIcon icon={user.isActive ? faCircleCheck : faCircleXmark} />
                }
                label="Status"
                value={
                  <span
                    className={`font-medium ${user.isActive ? 'text-success' : 'text-error'}`}
                  >
                    {user.isActive ? 'Conta verificada' : 'Inativa'}
                  </span>
                }
              />
            </div>
          </Card>

          {/* Sessão */}
          <Card flush>
            <div className="p-4 sm:p-5 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-error-soft text-error flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-text-main">Sessão</h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Encerre seu acesso neste dispositivo quando terminar.
                  </p>
                </div>
              </div>

              <Button
                variant="danger"
                fullWidth
                leftIcon={<FontAwesomeIcon icon={faRightFromBracket} />}
                onClick={async () => {
                  await logout();
                  navigate(mode === 'seller' ? '/' : '/');
                }}
              >
                Sair da conta
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3">
      <span className="flex items-center gap-2.5 text-xs sm:text-sm text-text-muted shrink-0 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:text-text-subtle">
        {icon}
        {label}
      </span>
      <span className="text-xs sm:text-sm font-medium text-text-main text-right min-w-0">
        {value}
      </span>
    </div>
  );
}
