import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { LoginForm } from '@/components/auth/LoginForm';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import { useAuth } from '@/hooks/useAuth';
import type { LoginFormData } from '@/utils/validationSchemas';
import { Link } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface GoogleAccountsId {
  initialize(opts: { client_id: string; callback: (response: { credential: string }) => void }): void;
  renderButton(parent: HTMLElement, opts: Record<string, unknown>): void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  // Use useAuth with redirect disabled since we want to stay on the same page
  const { login, loginWithGoogle } = useAuth({ redirect: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const showMockButton = !googleClientId;

  useEffect(() => {
    if (!isOpen) return;
    
    const google = (window as unknown as { google?: { accounts?: { id?: GoogleAccountsId } } }).google;
    if (googleClientId && google?.accounts?.id) {
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: { credential: string }) => {
          setError('');
          setLoading(true);
          try {
            await loginWithGoogle(response.credential);
            onSuccess?.();
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao fazer login com o Google');
          } finally {
            setLoading(false);
          }
        },
      });
      // We need a slight delay to ensure the DOM node is painted by the modal
      setTimeout(() => {
        const btn = document.getElementById('google-btn-modal');
        if (btn && google.accounts?.id) {
          google.accounts.id.renderButton(btn, {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
          });
        }
      }, 100);
    }
  }, [googleClientId, loginWithGoogle, isOpen, onClose, onSuccess]);

  const handleMockGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle('mock-google-token');
      onSuccess?.();
      onClose();
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
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Entre na sua conta"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-text-muted">
          Faça login para continuar.
        </p>
        
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        <LoginForm onSubmit={handleSubmit} isLoading={loading} />

        {/* Separador */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-surface px-3 text-xs text-text-muted">ou continue com</span>
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
            disabled={loading}
          >
            Google (simulador dev)
          </Button>
        ) : (
          <div id="google-btn-modal" className="w-full [&>div]:w-full!" />
        )}
        
        <div className="mt-4 text-center text-sm text-text-muted">
          Não tem uma conta?{' '}
          <Link to="/auth/register" className="text-primary font-medium hover:underline" onClick={onClose}>
            Cadastre-se
          </Link>
        </div>
      </div>
    </Modal>
  );
}
