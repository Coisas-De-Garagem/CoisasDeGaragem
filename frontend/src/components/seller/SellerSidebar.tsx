import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faBox, faTags, faQrcode, faCog, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    path: '/seller/dashboard',
    icon: <FontAwesomeIcon icon={faChartBar} className="w-5 h-5" />,
  },
  {
    label: 'Produtos',
    path: '/seller/products',
    icon: <FontAwesomeIcon icon={faBox} className="w-5 h-5" />,
  },
  {
    label: 'Vendas',
    path: '/seller/sales',
    icon: <FontAwesomeIcon icon={faTags} className="w-5 h-5" />,
  },
  {
    label: 'Estatísticas',
    path: '/seller/analytics',
    icon: <FontAwesomeIcon icon={faChartBar} className="w-5 h-5" />,
  },
  {
    label: 'Configurações',
    path: '/seller/settings',
    icon: <FontAwesomeIcon icon={faCog} className="w-5 h-5" />,
  },
];

interface SellerSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function SellerSidebar({ isOpen, onToggle }: SellerSidebarProps) {
  const location = useLocation();
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Menu do vendedor"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Painel do Vendedor
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4" aria-label="Navegação principal">
            <ul className="space-y-2" role="list">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path} role="listitem">
                    <Link
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-colors duration-200
                        ${isActive
                          ? 'bg-primary text-white font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/buyer/qr-scanner"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-primary hover:bg-primary-50 transition-colors font-medium border border-primary-100 group mb-2"
            >
              <FontAwesomeIcon icon={faQrcode} className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Modo Comprador</span>
            </Link>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium border border-red-100 group"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sair da Conta"
        size="sm"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Tem certeza que deseja sair da sua conta? Você precisará fazer login novamente para acessar o painel.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="tertiary"
              onClick={() => setShowLogoutModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="bg-red-600 hover:bg-red-700 text-white border-none"
              onClick={() => {
                logout();
                setShowLogoutModal(false);
              }}
            >
              Sim, Sair
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
