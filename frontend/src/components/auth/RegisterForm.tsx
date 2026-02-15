import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/utils/validationSchemas';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  isLoading?: boolean;
}

export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
      phone: '',
    },
  });

  const handleFormSubmit = async (data: RegisterFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        id="name"
        type="text"
        label="Nome completo"
        placeholder="João Silva"
        error={errors.name?.message}
        {...register('name')}
        fullWidth
        disabled={isLoading}
        autoComplete="name"
      />

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
        placeholder="Mínimo 8 caracteres"
        error={errors.password?.message}
        {...register('password')}
        fullWidth
        disabled={isLoading}
        autoComplete="new-password"
      />

      <Input
        id="confirmPassword"
        type="password"
        label="Confirmar senha"
        placeholder="Digite a senha novamente"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
        fullWidth
        disabled={isLoading}
        autoComplete="new-password"
      />
      {/* Role selection removed - defaulting to user */}

      <Input
        id="phone"
        type="tel"
        label="Telefone (opcional)"
        placeholder="+55 11 9999-9999"
        error={errors.phone?.message}
        {...register('phone')}
        fullWidth
        disabled={isLoading}
        autoComplete="tel"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isLoading}
      >
        Criar conta
      </Button>
    </form>
  );
}
