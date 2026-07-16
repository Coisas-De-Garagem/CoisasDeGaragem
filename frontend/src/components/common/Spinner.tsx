import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

export function Spinner({ size = 'md', className = '', label = 'Carregando' }: SpinnerProps) {
  return (
    <FontAwesomeIcon
      icon={faSpinner}
      spin
      className={`text-current ${SIZE_CLASSES[size]} ${className}`}
      role="status"
      aria-label={label}
    />
  );
}
