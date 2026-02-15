import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Alert } from '@/components/common/Alert';
import type { RegisterFormData } from '@/utils/validationSchemas';

export default function RegisterPage() {
  const { register } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: RegisterFormData) => {
    setError('');
    setLoading(true);

    try {
      await register(data.email, data.password, data.name, data.role, data.phone || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Criar conta
            </h1>
            <p className="text-gray-600">
              Comece sua jornada conosco hoje
            </p>
          </div>

          {error && (
            <Alert variant="error" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <RegisterForm onSubmit={handleSubmit} isLoading={loading} />

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/auth/login" className="text-primary hover:text-primary-hover font-medium">
                Entrar
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
