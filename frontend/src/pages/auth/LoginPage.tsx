import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { Alert } from '@/components/common/Alert';
import type { LoginFormData } from '@/utils/validationSchemas';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: LoginFormData) => {
    setError('');
    setLoading(true);

    try {
      await login(data.email, data.password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Entrar
            </h1>
            <p className="text-gray-600">
              Acesse sua conta para continuar
            </p>
          </div>

          {error && (
            <Alert variant="error" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <LoginForm onSubmit={handleSubmit} isLoading={loading} />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/auth/register" className="text-primary hover:text-primary-hover font-medium">
                Cadastre-se
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
