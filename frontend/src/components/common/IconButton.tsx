import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Conteúdo tipicamente um <Icon />. */
  children: ReactNode;
  variant?: IconButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  /** Rótulo acessível obrigatório (esses botões não têm texto). */
  label: string;
}

const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  primary: 'bg-primary hover:bg-primary-hover text-white',
  ghost: 'bg-transparent hover:bg-surface-hover text-text-muted hover:text-text-main',
  outline:
    'bg-transparent hover:bg-surface-hover text-text-main border border-border-strong',
  danger: 'bg-transparent hover:bg-error/10 text-error',
};

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const ICON_SIZE = {
  sm: '[&_svg]:w-4 [&_svg]:h-4',
  md: '[&_svg]:w-5 [&_svg]:h-5',
  lg: '[&_svg]:w-6 [&_svg]:h-6',
};

export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  label,
  className = '',
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-colors focus-visible:ring-2 focus-visible:ring-primary
        disabled:opacity-50 disabled:pointer-events-none
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${ICON_SIZE[size]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
