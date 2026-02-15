import { SellerLayout } from '@/components/seller/SellerLayout';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // TODO: Implement profile update API call
      console.log('Update profile:', { name: 'Updated Name' });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Configurações
          </h1>
          <p className="text-gray-600">
            Gerencie as configurações da sua conta de vendedor
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <FontAwesomeIcon icon={faCheck} className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Configurações salvas com sucesso!</p>
                <p className="text-sm text-green-700">Suas alterações foram aplicadas.</p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Informações do Perfil
            </h2>

            <div className="space-y-6">
              <Input
                id="name"
                type="text"
                label="Nome"
                defaultValue={user?.name || ''}
                placeholder="Seu nome"
                fullWidth
                disabled={loading}
              />

              <Input
                id="email"
                type="email"
                label="Email"
                defaultValue={user?.email || ''}
                placeholder="seu@email.com"
                fullWidth
                disabled={loading}
              />

              <Input
                id="phone"
                type="tel"
                label="Telefone"
                defaultValue={user?.phone || ''}
                placeholder="+55 11 9999-9999"
                fullWidth
                disabled={loading}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
              >
                Salvar Alterações
              </Button>
            </div>
          </div>

          {/* Account Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Configurações da Conta
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Notificações</h3>
                  <p className="text-sm text-gray-600">Receber alertas sobre novas vendas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary rounded-full peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:after:border-4 peer-checked:after:bg-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Atualizações de Email</h3>
                  <p className="text-sm text-gray-600">Receber resumos semanais de vendas</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={true}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary rounded-full peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-checked:after:border-4 peer-checked:after:bg-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-gray-200">
                <div>
                  <h3 className="font-medium text-gray-900">Idioma</h3>
                  <p className="text-sm text-gray-600">Português (Brasil)</p>
                </div>
                <select className="block w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (US)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={loading}
              >
                Salvar Configurações
              </Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-900 mb-4">
              Zona de Perigo
            </h2>
            <p className="text-sm text-red-700 mb-6">
              Estas ações são irreversíveis. Por favor, tenha cuidado.
            </p>

            <div className="space-y-4">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) {
                    // TODO: Implement account deletion
                    console.log('Delete account');
                  }
                }}
              >
                Excluir Minha Conta
              </Button>
            </div>
          </div>
        </form>
      </div>
    </SellerLayout>
  );
}
