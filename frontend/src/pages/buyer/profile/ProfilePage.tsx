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
} from '@fortawesome/free-solid-svg-icons';
import { ProfileForm } from '@/components/buyer/ProfileForm';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import type { DashboardType } from '@/types';

interface ProfilePageProps {
  mode?: DashboardType;
}

export default function ProfilePage({ mode = 'buyer' }: ProfilePageProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      // TODO: Implementar chamada à API de atualização de perfil.
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Erro ao atualizar perfil. Por favor, tente novamente.');
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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main flex items-center gap-3">
          <FontAwesomeIcon icon={faUserGear} className="text-primary" />
          Configurações de Perfil
        </h1>
        <p className="text-text-muted mt-1.5">
          Atualize suas informações de conta
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert variant="success" dismissible onDismiss={() => setSuccess('')}>
            {success}
          </Alert>
        </div>
      )}

      {/* Formulário */}
      <Card className="mb-6">
        <ProfileForm user={user} onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>

      {/* Informações da conta */}
      <Card>
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text-main">Informações da conta</h2>
        </div>
        <div className="divide-y divide-border">
          <InfoRow icon={<FontAwesomeIcon icon={faEnvelope} />} label="Email" value={user.email} />
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
            value={new Date(user.createdAt).toLocaleDateString('pt-BR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          />
          <InfoRow
            icon={
              <FontAwesomeIcon icon={user.isActive ? faCircleCheck : faCircleXmark} />
            }
            label="Status"
            value={
              <Badge variant={user.isActive ? 'success' : 'error'}>
                {user.isActive ? 'Ativa' : 'Inativa'}
              </Badge>
            }
          />
        </div>
        <div className="px-5 py-4 border-t border-border">
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
    <div className="flex items-center justify-between gap-3 px-5 py-3.5">
      <span className="flex items-center gap-2.5 text-sm text-text-muted [&_svg]:w-4 [&_svg]:h-4 [&_svg]:text-text-subtle">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium text-text-main text-right">{value}</span>
    </div>
  );
}
