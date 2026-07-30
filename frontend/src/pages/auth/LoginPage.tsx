import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import type { LoginFormData } from '@/utils/validationSchemas';

/** Subset da API do Google Identity Services que usamos. */
interface GoogleAccountsId {
  initialize(opts: { client_id: string; callback: (response: { credential: string }) => void }): void;
  renderButton(parent: HTMLElement, opts: Record<string, unknown>): void;
}

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const showMockButton = !googleClientId;

  useEffect(() => {
    const google = (window as unknown as { google?: { accounts?: { id?: GoogleAccountsId } } }).google;
    if (googleClientId && google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential: string }) => {
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
      const btn = document.getElementById('google-btn');
      if (btn) {
        google.accounts.id.renderButton(btn, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          width: '100%',
        });
      }
    }
  }, [googleClientId, loginWithGoogle]);

  const handleMockGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle('mock-google-token');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login simulado');
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
    <AuthLayout
      title="Entrar"
      subtitle="Acesse sua conta para continuar"
      footer={
        <>
          Não tem uma conta?{' '}
          <Link to="/auth/register" className="text-primary font-medium hover:underline">
            Cadastre-se
          </Link>
        </>
      }
    >
      {error && (
        <div className="mb-4">
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        </div>
      )}

      <LoginForm onSubmit={handleSubmit} isLoading={loading} />

      {/* Separador */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-text-muted">ou continue com</span>
        </div>
      </div>

      {/* Google */}
      {showMockButton ? (
        <Button
          variant="outline"
          fullWidth
          size="lg"
          onClick={handleMockGoogleLogin}
          leftIcon={<GoogleIcon />}
        >
          Google (simulador dev)
        </Button>
      ) : (
        <div id="google-btn" className="w-full [&>div]:w-full!" />
      )}
    </AuthLayout>
  );
}
