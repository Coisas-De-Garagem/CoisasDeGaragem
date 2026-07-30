import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BOTTOM_NAV } from './navigation';
import type { DashboardType } from '@/types';

interface BottomNavProps {
  mode: DashboardType;
}

/**
 * Barra de navegação inferior (mobile). Fixa no rodapé, com safe-area,
 * ícone + rótulo, máximo 5 itens.
 */
export function BottomNav({ mode }: BottomNavProps) {
  const items = BOTTOM_NAV[mode];

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border pb-safe"
      aria-label="Navegação principal"
    >
      <ul className="flex items-stretch justify-around h-14">
        {items.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 h-full text-[10px] transition-colors ${
                  isActive ? 'text-primary' : 'text-text-subtle'
                }`
              }
            >
              <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
              <span className="truncate max-w-full px-1">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
