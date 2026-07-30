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
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { Logo } from './Logo';

interface SidebarProps {
  mode: DashboardType;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ mode, collapsed, onToggle }: SidebarProps) {
  const groups = NAVIGATION[mode];
  const switchTarget = MODE_SWITCH[mode];
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    const isCurrentActive = location.pathname === path;
    if (collapsed) {
      onToggle();
    } else if (isCurrentActive) {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <aside
      className={`hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 bg-surface border-r border-border transition-[width] duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      aria-label={`Menu do ${mode === 'seller' ? 'vendedor' : 'comprador'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 h-14 px-4 border-b border-border">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <Logo className="w-7 h-7 flex-shrink-0" />
          {!collapsed && (
            <span className="font-display font-semibold text-text-main text-sm truncate">
              Coisas<span className="text-primary">DeGaragem</span>
            </span>
          )}
        </Link>
      </div>

      {/* Grupos de navegação */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 no-scrollbar">
        {groups.map((group) => (
          <div key={group.heading} className="mb-4">
            {!collapsed && (
              <p className="px-3 mb-1 text-xs font-medium uppercase tracking-wide text-text-subtle">
                {group.heading}
              </p>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={(e) => handleNavClick(e, item.path)}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 py-2.5 text-sm transition-all ${
                        collapsed ? 'justify-center mx-2 rounded-lg px-0' : 'px-4'
                      } ${
                        isActive
                          ? `text-primary font-medium bg-primary/5 ${collapsed ? 'bg-primary/10' : 'border-l-[3px] border-primary'}`
                          : `text-text-muted hover:bg-surface-hover hover:text-text-main ${collapsed ? '' : 'border-l-[3px] border-transparent hover:border-primary/50'}`
                      }`
                    }
                  >
                    <FontAwesomeIcon icon={item.icon} className="w-[18px] h-[18px] flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Troca de modo */}
      <div className="px-3 pb-2">
        <Link
          to={switchTarget.to}
          title={collapsed ? switchTarget.label : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent-700 dark:text-accent-300 hover:bg-accent/10 transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <FontAwesomeIcon icon={faRightLeft} className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>{switchTarget.label}</span>}
        </Link>
      </div>

      {/* Perfil + logout (na mesma linha) */}
      <div className="border-t border-border p-3">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-main truncate">{user?.name}</p>
              <p className="text-xs text-text-muted truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              title="Sair da conta"
              aria-label="Sair da conta"
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-text-subtle hover:text-error hover:bg-error/10 transition-colors"
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            title="Sair da conta"
            aria-label="Sair da conta"
            className="mt-2 mx-auto flex items-center justify-center w-9 h-9 rounded-lg text-text-subtle hover:text-error hover:bg-error/10 transition-colors"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="w-[18px] h-[18px]" />
          </button>
        )}
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
