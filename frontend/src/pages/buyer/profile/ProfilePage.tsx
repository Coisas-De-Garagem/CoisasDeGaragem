import { BuyerLayout } from '@/components/buyer/BuyerLayout';
import { ProfileForm } from '@/components/buyer/ProfileForm';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/common/Spinner';
import { Alert } from '@/components/common/Alert';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserCog,
  faEnvelope,
  faUserTag,
  faCalendar,
  faCheckCircle,
  faTimesCircle,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (_data: { name?: string; phone?: string; avatarUrl?: string }) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement API call to update user profile
      // For now, just show success message
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Erro ao atualizar perfil. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <BuyerLayout>
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FontAwesomeIcon icon={faUserCog} className="text-primary" />
            Configurações de Perfil
          </h1>
          <p className="text-gray-600 mt-2">
            Atualize suas informações de conta
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" dismissible onDismiss={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <ProfileForm
            user={user}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informações da Conta
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200 items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 w-4" />
                Email:
              </span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faUserTag} className="text-gray-400 w-4" />
                Tipo de Conta:
              </span>
              <span className="font-medium text-primary capitalize">{user.role === 'admin' ? 'Administrador' : 'Usuário'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200 items-center">
              <span className="text-gray-600 flex items-center gap-2">
                <FontAwesomeIcon icon={faCalendar} className="text-gray-400 w-4" />
                Data de Cadastro:
              </span>
              <span className="font-medium text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {user.isActive ? (
              <div className="flex justify-between py-2 items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 w-4" />
                  Status da Conta:
                </span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <FontAwesomeIcon icon={faCheckCircle} className="w-4" />
                  Ativa
                </span>
              </div>
            ) : (
              <div className="flex justify-between py-2 items-center">
                <span className="text-gray-600 flex items-center gap-2">
                  <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 w-4" />
                  Status da Conta:
                </span>
                <span className="font-medium text-red-600 flex items-center gap-1">
                  <FontAwesomeIcon icon={faTimesCircle} className="w-4" />
                  Inativa
                </span>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              if (window.confirm('Tem certeza que deseja sair?')) {
                logout();
                window.location.href = '/';
              }
            }}
            className="w-full mt-6 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faRightFromBracket} />
            Sair da Conta
          </button>
        </div>
      </div>
    </BuyerLayout>
  );
}
