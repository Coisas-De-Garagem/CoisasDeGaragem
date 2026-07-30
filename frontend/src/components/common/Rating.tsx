import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

interface RatingProps {
  value: number;
  max?: number;
  /** Tamanho das estrelas. */
  size?: 'sm' | 'md' | 'lg';
  /** Permite interação (input). */
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-6 h-6',
};

/**
 * Avaliação por estrelas (display ou input). Usa apenas ícones.
 */
export function Rating({
  value,
  max = 5,
  size = 'md',
  interactive = false,
  onChange,
  className = '',
}: RatingProps) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${className}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`${value} de ${max} estrelas`}
    >
      {Array.from({ length: max }).map((_, i) => {
        const starValue = i + 1;
        const active = starValue <= display;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHover(starValue)}
            onMouseLeave={() => interactive && setHover(0)}
            className={
              interactive
                ? 'cursor-pointer transition-transform hover:scale-110 disabled:cursor-default'
                : 'cursor-default'
            }
            aria-label={`${starValue} estrela${starValue > 1 ? 's' : ''}`}
            tabIndex={interactive ? 0 : -1}
          >
            <FontAwesomeIcon
              icon={faStar}
              className={`${SIZE_CLASSES[size]} ${
                active ? 'text-accent' : 'text-neutral-300 dark:text-neutral-700'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
