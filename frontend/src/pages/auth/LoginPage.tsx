import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { Alert } from '@/components/common/Alert';
import type { LoginFormData } from '@/utils/validationSchemas';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const showMockButton = !googleClientId;

  useEffect(() => {
    if (googleClientId && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          setError('');
          setLoading(true);
          try {
            await loginWithGoogle(response.credential);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login com o Google');
          } finally {
            setLoading(false);
          }
        },
      });

      (window as any).google.accounts.id.renderButton(
        document.getElementById('google-btn'),
        { theme: 'outline', size: 'large', text: 'signin_with', width: '100%' }
      );
    }
  }, [googleClientId, loginWithGoogle]);

  const handleMockGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle('mock-google-token');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login simulado com o Google');
    } finally {
      setLoading(false);
    }
  };

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

          {/* Separator */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-400 font-medium">ou continuar com</span>
            </div>
          </div>

          {/* Google Sign-in */}
          <div className="w-full flex justify-center">
            {showMockButton ? (
              <button
                type="button"
                onClick={handleMockGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white hover:bg-gray-50 text-gray-700 font-semibold transition-all duration-200 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.58 14.99 1 12 1 7.35 1 3.37 3.68 1.43 7.6l3.82 2.96C6.18 7.37 8.87 5.04 12 5.04z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.47h6.47c-.28 1.47-1.11 2.71-2.35 3.55l3.66 2.84c2.14-1.97 3.71-4.88 3.71-8.52z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.25 14.76c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.43 7.6C.52 9.43 0 11.53 0 13.75s.52 4.32 1.43 6.15l3.82-2.96c-.25-.76-.39-1.57-.39-2.41z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.01.68-2.32 1.09-4.3 1.09-3.13 0-5.82-2.33-6.77-5.52l-3.82 2.96C3.37 20.32 7.35 23 12 23z"
                  />
                </svg>
                Google (Simulador Dev)
              </button>
            ) : (
              <div id="google-btn" className="w-full"></div>
            )}
          </div>

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
