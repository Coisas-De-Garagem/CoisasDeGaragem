import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  header?: ReactNode;
  body?: ReactNode;
  footer?: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({
  children,
  header,
  body,
  footer,
  className = '',
  hoverable = false,
  onClick,
}: CardProps) {
  const baseClasses = 'bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden';
  const hoverClasses = hoverable ? 'hover:shadow-md hover:border-primary-100 transition-all duration-300 cursor-pointer hover:-translate-y-0.5' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={hoverable ? 'button' : undefined}
      tabIndex={hoverable ? 0 : undefined}
    >
      {header && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          {header}
        </div>
      )}
      {body && (
        <div className="px-6 py-4">
          {body}
        </div>
      )}
      {footer && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          {footer}
        </div>
      )}
      {!header && !body && !footer && (
        <div className="px-6 py-4">
          {children}
        </div>
      )}
    </div>
  );
}
