import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightLeft } from '@fortawesome/free-solid-svg-icons';
import { DarkModeToggle } from '@/components/common/DarkModeToggle';
import { Avatar } from '@/components/common/Avatar';
import { useAuthStore } from '@/store/authStore';
import { MODE_SWITCH } from './navigation';
import type { DashboardType } from '@/types';

interface TopBarProps {
  mode: DashboardType;
  title?: string;
}

/**
 * Barra superior dentro do painel. Fina, surface sólida, sem backdrop blur.
 */
export function TopBar({ mode, title }: TopBarProps) {
  const { user } = useAuthStore();
  const switchTarget = MODE_SWITCH[mode];

  return (
    <header className="sticky top-0 z-20 h-14 flex items-center gap-3 px-4 sm:px-6 bg-surface border-b border-border">
      <h1 className="lg:hidden text-base font-medium text-text-main truncate flex-1">
        {title ?? (mode === 'seller' ? 'Vendedor' : 'Comprador')}
      </h1>

      <div className="hidden lg:flex items-center gap-2 flex-1">
        <span className="text-sm text-text-muted">
          Olá, <span className="font-medium text-text-main">{user?.name?.split(' ')[0]}</span>
        </span>
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <DarkModeToggle />
        <Link
          to={switchTarget.to}
          className="lg:hidden inline-flex items-center gap-2 h-9 px-3 rounded-md text-sm font-medium text-text-muted hover:text-text-main hover:bg-surface-hover transition-colors"
          title={switchTarget.label}
        >
          <FontAwesomeIcon icon={faRightLeft} className="w-4 h-4" />
          <span className="hidden md:inline">{switchTarget.label}</span>
        </Link>
        <Link
          to={mode === 'seller' ? '/seller/profile' : '/buyer/profile'}
          className="ml-1"
          aria-label="Ver perfil"
        >
          <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
        </Link>
      </div>
    </header>
  );
}
