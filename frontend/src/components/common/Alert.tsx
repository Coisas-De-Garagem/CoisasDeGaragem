import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faTimesCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

interface AlertProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export function Alert({
  children,
  variant = 'info',
  dismissible = false,
  onDismiss,
  className = '',
}: AlertProps) {
  const variantClasses = {
    success: 'bg-success/10 border-success text-success',
    warning: 'bg-warning/10 border-warning text-warning',
    error: 'bg-error/10 border-error text-error',
    info: 'bg-secondary/10 border-secondary text-secondary',
  };

  const iconMap = {
    success: <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />,
    warning: <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5" />,
    error: <FontAwesomeIcon icon={faTimesCircle} className="w-5 h-5" />,
    info: <FontAwesomeIcon icon={faInfoCircle} className="w-5 h-5" />,
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border ${variantClasses[variant]} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0">{iconMap[variant]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{children}</p>
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
          aria-label="Dismiss"
        >
          <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
