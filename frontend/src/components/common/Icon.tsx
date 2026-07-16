import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';

/**
 * Wrapper centralizado para ícones Font Awesome.
 * Garante tamanho consistente e acessibilidade em todo o app.
 *
 * Uso:
 *   import { faHouse } from '@fortawesome/free-solid-svg-icons';
 *   <Icon icon={faHouse} size="md" />
 */
type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<IconSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

interface IconProps {
  icon: IconDefinition;
  size?: IconSize;
  className?: string;
  /** Rótulo acessível. Se omitido, o ícone é tratado como decorativo (aria-hidden). */
  label?: string;
  spin?: boolean;
  fixedWidth?: boolean;
}

export function Icon({
  icon,
  size = 'md',
  className = '',
  label,
  spin = false,
  fixedWidth = false,
}: IconProps) {
  return (
    <FontAwesomeIcon
      icon={icon}
      className={`${SIZE_MAP[size]} ${className}`}
      spin={spin}
      fixedWidth={fixedWidth}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
