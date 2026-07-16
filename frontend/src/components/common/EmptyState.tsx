import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Estado vazio / sem resultados. Compatível com dark mode.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
    >
      {icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-surface-sunken text-text-subtle mb-4 [&_svg]:w-8 [&_svg]:h-8">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-text-main">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-text-muted max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
