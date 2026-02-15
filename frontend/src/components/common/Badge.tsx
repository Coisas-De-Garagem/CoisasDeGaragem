import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'gray',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantClasses = {
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    error: 'bg-error text-white',
    info: 'bg-secondary text-white',
    gray: 'bg-gray-100 text-gray-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}
