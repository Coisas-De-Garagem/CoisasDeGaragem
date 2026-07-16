import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-2xl',
};

/** Retorna as iniciais (1–2 letras) do nome. */
function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const cls = `inline-flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold overflow-hidden flex-shrink-0 ${SIZE_CLASSES[size]} ${className}`;

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={`${cls} object-cover`}
        referrerPolicy="no-referrer"
      />
    );
  }

  const initials = getInitials(name);
  return (
    <span className={cls} aria-label={name || 'Usuário'}>
      {initials || <FontAwesomeIcon icon={faUser} />}
    </span>
  );
}
