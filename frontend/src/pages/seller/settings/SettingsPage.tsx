import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { useAuth } from '@/hooks/useAuth';

/** Botão toggle (switch) acessível, no padrão do design system. */
function Toggle({
  defaultChecked = false,
  label,
  description,
}: {
  defaultChecked?: boolean;
  label: string;
  description: string;
}) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <h3 className="text-sm font-medium text-text-main">{label}</h3>
        <p className="text-sm text-text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked((v) => !v)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          checked ? 'bg-primary' : 'bg-neutral-300 dark:bg-neutral-700'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      // TODO: Implementar chamada à API de atualização de perfil.
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-main">Configurações</h1>
        <p className="text-text-muted mt-1">
          Gerencie as configurações da sua conta de vendedor
        </p>
      </div>

      {success && (
        <Alert variant="success" dismissible onDismiss={() => setSuccess(false)}>
          Configurações salvas com sucesso! Suas alterações foram aplicadas.
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Perfil */}
        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-main">Informações do perfil</h2>
          </div>
          <div className="px-5 py-5 space-y-4">
            <Input
              id="name"
              name="name"
              type="text"
              label="Nome"
              defaultValue={user?.name || ''}
              placeholder="Seu nome"
              fullWidth
              disabled={loading}
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              defaultValue={user?.email || ''}
              placeholder="seu@email.com"
              fullWidth
              disabled={loading}
            />
            <Input
              id="phone"
              name="phone"
              type="tel"
              label="Telefone"
              defaultValue={user?.phone || ''}
              placeholder="(11) 99999-9999"
              fullWidth
              disabled={loading}
            />
          </div>
        </Card>

        {/* Preferências */}
        <Card>
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text-main">Preferências</h2>
          </div>
          <div className="px-5 py-2 divide-y divide-border">
            <Toggle
              label="Notificações de vendas"
              description="Receba alertas sobre novas vendas"
              defaultChecked
            />
            <Toggle
              label="Resumo por email"
              description="Receba um resumo semanal das suas vendas"
              defaultChecked
            />
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-text-main">Idioma</h3>
                <p className="text-sm text-text-muted">Selecione o idioma da interface</p>
              </div>
              <div className="w-40 flex-shrink-0">
                <Select
                  id="language"
                  name="language"
                  options={[
                    { value: 'pt-BR', label: 'Português (Brasil)' },
                    { value: 'en-US', label: 'English (US)' },
                  ]}
                  defaultValue="pt-BR"
                />
              </div>
            </div>
          </div>
          <div className="px-5 py-4 border-t border-border flex justify-end">
            <Button type="submit" variant="primary" isLoading={loading}>
              Salvar configurações
            </Button>
          </div>
        </Card>

        {/* Zona de perigo */}
        <Card className="border-error/30">
          <div className="px-5 py-4 border-b border-error/30">
            <h2 className="text-lg font-semibold text-error">Zona de perigo</h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm text-text-muted mb-4">
              Estas ações são irreversíveis. Por favor, tenha cuidado.
            </p>
            <Button
              variant="danger"
              onClick={() => {
                if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) {
                  // TODO: Implementar exclusão de conta.
                  console.log('Delete account');
                }
              }}
            >
              Excluir minha conta
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
