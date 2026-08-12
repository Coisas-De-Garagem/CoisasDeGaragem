import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Aplica efeito de hover e cursor pointer. */
  hoverable?: boolean;
  /** Remove padding interno do corpo. */
  flush?: boolean;
  /** Permite overflow visible */
  overflowVisible?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  header,
  body,
  footer,
  className = '',
  hoverable = false,
  flush = false,
  overflowVisible = false,
  onClick,
}: CardProps) {
  const baseClasses = `bg-surface rounded-lg border border-border ${overflowVisible ? '' : 'overflow-hidden'}`;
  const hoverClasses = hoverable
    ? 'hover:border-border-strong hover:bg-surface-hover transition-colors cursor-pointer'
    : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={hoverable ? 'button' : undefined}
      tabIndex={hoverable ? 0 : undefined}
    >
      {header && (
        <div className="px-5 py-4 border-b border-border">{header}</div>
      )}
      {body && <div className={flush ? '' : 'px-5 py-4'}>{body}</div>}
      {footer && (
        <div className="px-5 py-4 border-t border-border bg-surface-2">{footer}</div>
      )}
      {!header && !body && !footer && (
        <div className={flush ? '' : 'px-5 py-4'}>{children}</div>
      )}
    </div>
  );
}
