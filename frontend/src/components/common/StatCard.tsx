import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: ReactNode;
  /** Ícone exibido no canto. */
  icon?: ReactNode;
  /** Texto auxiliar, ex.: "+12%". */
  hint?: ReactNode;
  /** Variante de cor do ícone. */
  tone?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'gray';
  className?: string;
}

const TONE_CLASSES = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/15 text-accent-600 dark:text-accent-300',
  success: 'bg-success/15 text-success',
  warning: 'bg-warning/15 text-amber-600 dark:text-amber-300',
  error: 'bg-error/15 text-error',
  info: 'bg-info/15 text-info',
  gray: 'bg-neutral-200/70 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
};

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = 'primary',
  className = '',
}: StatCardProps) {
  return (
    <div
      className={`bg-surface rounded-xl border border-border shadow-sm p-4 sm:p-5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-text-muted truncate">{label}</p>
          <p className="mt-1 text-2xl font-bold text-text-main tabular-nums tracking-tight">
            {value}
          </p>
          {hint && <div className="mt-1 text-xs text-text-muted">{hint}</div>}
        </div>
        {icon && (
          <span
            className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-lg [&_svg]:w-5 [&_svg]:h-5 ${TONE_CLASSES[tone]}`}
          >
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}
