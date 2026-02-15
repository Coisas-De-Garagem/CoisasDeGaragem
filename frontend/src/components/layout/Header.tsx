import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/common/Button';
import { DarkModeToggle } from '@/components/common/DarkModeToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">CoisasDeGaragem</span>
          </Link>

          {/* Dark Mode Toggle */}
          <div className="hidden md:flex items-center space-x-4">
            <DarkModeToggle />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-gray-700 dark:text-gray-200">
                  Olá, <span className="font-medium">{user?.name}</span>
                </span>
                <Link to="/buyer/qr-scanner" className="text-gray-700 dark:text-gray-200 hover:text-primary transition-colors">
                  Comprar
                </Link>
                <Link to="/seller/dashboard" className="text-gray-700 dark:text-gray-200 hover:text-primary transition-colors">
                  Vender
                </Link>
                <Button variant="tertiary" size="md" className="font-medium px-6 border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200" onClick={handleLogout}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth/login">
                  <Button variant="tertiary" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button variant="primary" size="sm">
                    Cadastrar
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <DarkModeToggle />
            <button
              className="p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Open menu"
            >
              <FontAwesomeIcon icon={faBars} className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
