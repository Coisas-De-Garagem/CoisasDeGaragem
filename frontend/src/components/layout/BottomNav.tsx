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
    <div className="md:hidden fixed bottom-5 inset-x-4 z-40 pb-safe pointer-events-none">
      <nav
        className="bg-surface/95 backdrop-blur-md border border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-3xl overflow-hidden pointer-events-auto"
        aria-label="Navegação principal"
      >
        <ul className="flex items-center justify-around h-[68px] px-2 gap-1">
          {items.map((item) => (
            <li key={item.path} className="flex-1 h-full py-1.5">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center h-full rounded-2xl transition-all duration-300 ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-text-subtle hover:bg-surface-hover hover:text-text-main'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute top-1.5 w-1.5 h-1.5 rounded-full bg-orange-500" />
                    )}
                    <FontAwesomeIcon icon={item.icon} className={`w-[20px] h-[20px] transition-all ${isActive ? 'mt-2 mb-0.5' : 'mb-1'}`} />
                    <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
