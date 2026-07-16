import type { ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faCircleXmark,
  faCircleInfo,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

type AlertVariant = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  children: ReactNode;
  variant?: AlertVariant;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  success: 'bg-success-soft/60 border-success/40 text-emerald-800 dark:text-emerald-300',
  warning: 'bg-warning-soft/60 border-warning/40 text-amber-800 dark:text-amber-300',
  error: 'bg-error-soft/60 border-error/40 text-red-800 dark:text-red-300',
  info: 'bg-info-soft/60 border-info/40 text-sky-800 dark:text-sky-300',
};

const ICON_MAP: Record<AlertVariant, ReactNode> = {
  success: <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />,
  warning: <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5" />,
  error: <FontAwesomeIcon icon={faCircleXmark} className="w-5 h-5" />,
  info: <FontAwesomeIcon icon={faCircleInfo} className="w-5 h-5" />,
};

export function Alert({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertProps) {
  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-lg border ${VARIANT_CLASSES[variant]} ${className}`}
      role="alert"
    >
      <span className="flex-shrink-0 mt-0.5">{ICON_MAP[variant]}</span>
      <div className="flex-1 min-w-0 text-sm">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="text-current/90">{children}</div>
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 -mt-1 -mr-1 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Fechar aviso"
        >
          <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
