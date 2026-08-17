import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useUIStore } from '@/store/uiStore';
import { makeNotifier } from '@/utils/notifications';
import type { RegisterFormData } from '@/utils/validationSchemas';

export default function RegisterPage() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const { addNotification } = useUIStore();
  const notify = makeNotifier(addNotification);

  const handleSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await register(data.email, data.password, data.name, data.role, data.phone || undefined);
    } catch (err) {
      notify('error', 'Erro', err instanceof Error ? err.message : 'Erro ao fazer cadastro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece a comprar e vender hoje mesmo"
      footer={
        <>
          Já tem uma conta?{' '}
          <Link to="/auth/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <RegisterForm onSubmit={handleSubmit} isLoading={loading} />
    </AuthLayout>
  );
}
