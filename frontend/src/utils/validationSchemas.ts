import { z } from 'zod';

/**
 * Zod validation schemas for authentication forms
 * These schemas provide type-safe validation with clear error messages
 */

/**
 * Login form validation schema
 * - Email must be valid format
 * - Password is required
 */
export const loginSchema = z.object({
  email: z
    .string({
      message: 'Email é obrigatório',
    })
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  password: z
    .string({
      message: 'Senha é obrigatória',
    })
    .min(1, 'Senha é obrigatória'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register form validation schema
 * - Email must be valid format
 * - Password must meet complexity requirements:
 *   - Minimum 8 characters
 *   - At least 1 uppercase letter
 *   - At least 1 lowercase letter
 *   - At least 1 number
 * - Name must be at least 2 characters
 * - Role must be either 'seller' or 'buyer'
 * - Phone is optional but must be valid format if provided
 */
export const registerSchema = z
  .object({
    email: z
      .string({
        message: 'Email é obrigatório',
      })
      .min(1, 'Email é obrigatório')
      .email('Formato de email inválido'),
    password: z
      .string({
        message: 'Senha é obrigatória',
      })
      .min(8, 'A senha deve ter no mínimo 8 caracteres')
      .regex(
        /[A-Z]/,
        'A senha deve conter pelo menos uma letra maiúscula'
      )
      .regex(
        /[a-z]/,
        'A senha deve conter pelo menos uma letra minúscula'
      )
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número'),
    confirmPassword: z
      .string({
        message: 'Confirmação de senha é obrigatória',
      })
      .min(1, 'Confirmação de senha é obrigatória'),
    name: z
      .string({
        message: 'Nome é obrigatório',
      })
      .min(2, 'O nome deve ter no mínimo 2 caracteres')
      .max(100, 'O nome deve ter no máximo 100 caracteres'),
    role: z.enum(['user', 'admin'], { // Allow admin for dev, or just user
      message: 'Tipo de conta é obrigatório',
    }),
    phone: z
      .string()
      .optional()
      .refine(
        (value) => !value || /^\+?[1-9]\d{1,14}$/.test(value),
        'Formato de telefone inválido'
      ),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'As senhas não coincidem',
      path: ['confirmPassword'],
    }
  );

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Profile update form validation schema
 * - Name is optional but must be valid if provided
 * - Phone is optional but must be valid if provided
 * - Avatar URL is optional but must be valid URL if provided
 */
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter no mínimo 2 caracteres')
    .max(100, 'O nome deve ter no máximo 100 caracteres')
    .optional(),
  phone: z
    .string()
    .refine(
      (value) => !value || /^\+?[1-9]\d{1,14}$/.test(value),
      'Formato de telefone inválido'
    )
    .optional(),
  avatarUrl: z
    .string()
    .url('URL inválida')
    .optional(),
});

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
