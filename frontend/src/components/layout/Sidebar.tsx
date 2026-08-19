import { NavLink, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRightLeft,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { NAVIGATION, MODE_SWITCH } from './navigation';
import type { DashboardType } from '@/types';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Tooltip } from '@/components/common/Tooltip';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Logo } from './Logo';

interface SidebarProps {
  mode: DashboardType;
}

export function Sidebar({ mode }: SidebarProps) {
  const groups = NAVIGATION[mode];
  const switchTarget = MODE_SWITCH[mode];
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    const isCurrentActive = location.pathname === path;
    if (isCurrentActive) {
      e.preventDefault();
    }
  };

  return (
    <aside
      className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-surface border-r border-border w-20"
      aria-label={`Menu do ${mode === 'seller' ? 'vendedor' : 'comprador'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-14 px-4 border-b border-border">
        <Tooltip content="Home" side="right">
          <Link to="/" className="flex items-center gap-2 min-w-0">
            <Logo className="w-7 h-7 flex-shrink-0" />
          </Link>
        </Tooltip>
      </div>

      {/* Grupos de navegação */}
      <nav className="flex-1 py-3 px-3">
        {groups.map((group) => (
          <div key={group.heading} className="mb-4">
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path} className="flex justify-center">
                  <Tooltip content={item.label} side="right">
                    <NavLink
                      to={item.path}
                      onClick={(e) => handleNavClick(e, item.path)}
                      className={({ isActive }) =>
                        `relative flex items-center justify-center w-10 h-10 rounded-lg text-sm transition-all ${
                          isActive
                            ? 'text-primary font-medium bg-primary/10'
                            : 'text-text-muted hover:bg-surface-hover hover:text-text-main'
                        }`
                      }
                    >
                      <FontAwesomeIcon icon={item.icon} className="w-[18px] h-[18px] flex-shrink-0" />
                    </NavLink>
                  </Tooltip>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Troca de modo */}
      <div className="px-3 pb-2 flex justify-center">
        <Tooltip content={switchTarget.label} side="right">
          <Link
            to={switchTarget.to}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium text-accent-700 dark:text-accent-300 hover:bg-accent/10 transition-colors"
          >
            <FontAwesomeIcon icon={faRightLeft} className="w-5 h-5 flex-shrink-0" />
          </Link>
        </Tooltip>
      </div>

      {/* Perfil + logout */}
      <div className="border-t border-border p-3 flex flex-col items-center gap-3">
        <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
        <Tooltip content="Sair da conta" side="right">
          <button
            type="button"
            onClick={(e) => {
              setShowLogoutModal(true);
              e.currentTarget.blur();
            }}
            aria-label="Sair da conta"
            className="flex items-center justify-center w-10 h-10 rounded-lg text-text-subtle hover:text-error hover:bg-error/10 transition-colors"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-[18px] h-[18px]" />
          </button>
        </Tooltip>
      </div>

      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sair da conta"
        description="Você precisará entrar novamente para acessar o painel."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowLogoutModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => { logout(); setShowLogoutModal(false); }}>
              Sim, sair
            </Button>
          </>
        }
      >
        <p className="text-sm text-text-muted">
          Tem certeza que deseja encerrar sua sessão?
        </p>
      </Modal>
    </aside>
  );
}
