import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'accent' | 'danger' | 'success' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  accent: 'bg-accent-500 text-white hover:bg-accent-600',
  danger: 'bg-error text-white hover:bg-red-600',
  success: 'bg-success text-white hover:bg-green-600',
  outline:
    'bg-transparent text-text-main border border-border-strong hover:bg-surface-hover',
  ghost:
    'bg-transparent text-text-muted hover:text-text-main hover:bg-surface-hover',
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md
        font-medium transition-colors select-none
        disabled:opacity-50 disabled:pointer-events-none
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${widthClass}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <Spinner size="sm" className="text-current" />
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}
