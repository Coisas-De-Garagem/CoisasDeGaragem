import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/utils/validationSchemas';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const handleFormSubmit = async (data: LoginFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        id="email"
        type="email"
        label="Email"
        placeholder="seu@email.com"
        error={errors.email?.message}
        {...register('email')}
        fullWidth
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        id="password"
        type="password"
        label="Senha"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
        fullWidth
        disabled={isLoading}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
      >
        Entrar
      </Button>
    </form>
  );
}
