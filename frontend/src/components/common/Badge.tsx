import type { ReactNode } from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'gray' | 'accent' | 'primary';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  /** Exibe um pontinho antes do conteúdo (status indicator). */
  dot?: boolean;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-amber-700 dark:text-amber-300',
  error: 'bg-error/15 text-error',
  info: 'bg-info/15 text-info',
  accent: 'bg-accent/15 text-accent-700 dark:text-accent-300',
  primary: 'bg-primary/15 text-primary',
  gray: 'bg-neutral-200/70 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-1.5',
};

const DOT_COLOR: Record<BadgeVariant, string> = {
  success: 'bg-success',
  warning: 'bg-amber-500',
  error: 'bg-error',
  info: 'bg-info',
  accent: 'bg-accent',
  primary: 'bg-primary',
  gray: 'bg-neutral-500',
};

export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  dot = false,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[variant]}`} />}
      {children}
    </span>
  );
}
