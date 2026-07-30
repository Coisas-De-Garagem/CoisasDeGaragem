import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { DarkModeToggle } from '@/components/common/DarkModeToggle';
import { IconButton } from '@/components/common/IconButton';
import { Avatar } from '@/components/common/Avatar';
import { Logo } from './Logo';

const PUBLIC_LINKS = [
  { label: 'Como funciona', to: '/#como-funciona' },
  { label: 'Sobre', to: '/about' },
  { label: 'Ajuda', to: '/help' },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <Logo className="h-8 w-auto" />
            <span className="font-display font-semibold text-text-main">
              Coisas<span className="text-primary">DeGaragem</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 text-sm text-text-muted hover:text-text-main transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Ações desktop */}
          <div className="hidden md:flex items-center gap-2">
            <DarkModeToggle />
            {isAuthenticated ? (
              <>
                <Link to="/buyer/qr-scanner" className="hidden lg:block">
                  <Button variant="ghost" size="sm">Comprar</Button>
                </Link>
                <Link to="/seller/dashboard">
                  <Button variant="primary" size="sm">Vender</Button>
                </Link>
                <Link to="/buyer/profile" aria-label="Perfil">
                  <Avatar name={user?.name} src={user?.avatarUrl} size="sm" />
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="primary" size="sm">Cadastrar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Ações mobile */}
          <div className="flex md:hidden items-center gap-1">
            <DarkModeToggle />
            <IconButton
              label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <FontAwesomeIcon icon={menuOpen ? faXmark : faBars} />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-surface">
          <nav className="px-4 py-3 space-y-1">
            {PUBLIC_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2.5 rounded-md text-sm text-text-main hover:bg-surface-hover transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-border grid grid-cols-2 gap-2">
              {isAuthenticated ? (
                <>
                  <Link to="/buyer/qr-scanner" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>Comprar</Button>
                  </Link>
                  <Link to="/seller/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth>Vender</Button>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="col-span-2 px-3 py-2.5 rounded-md text-sm font-medium text-error hover:bg-error/10 transition-colors text-left"
                  >
                    Sair da conta
                  </button>
                </>
              ) : (
                <>
                  <Link to="/auth/login" onClick={() => setMenuOpen(false)}>
                    <Button variant="outline" size="sm" fullWidth>Entrar</Button>
                  </Link>
                  <Link to="/auth/register" onClick={() => setMenuOpen(false)}>
                    <Button variant="primary" size="sm" fullWidth>Cadastrar</Button>
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
