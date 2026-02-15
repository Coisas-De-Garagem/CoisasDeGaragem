import { BuyerSidebar } from '@/components/buyer/BuyerSidebar';
// import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

interface BuyerLayoutProps {
  children: React.ReactNode;
}

export function BuyerLayout({ children }: BuyerLayoutProps) {
  //   const isMobile = useMediaQuery('(max-width: 1023px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile header */}
      <header className="lg:hidden bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu"
          >
            <FontAwesomeIcon icon={faBars} className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Painel do Comprador
          </h1>
        </div>
      </header>

      {/* Desktop header (hidden on mobile) */}
      {/* Desktop Header Removed as per user request */}
      {/* <header className="hidden lg:flex bg-white shadow-sm sticky top-0 z-30 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
            <h1 className="text-xl font-bold text-gray-900">
              Painel do Comprador
            </h1>
            <div className="flex items-center gap-4">
              
            </div>
          </div>
        </header> */}

      {/* Main content area */}
      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar */}
        <BuyerSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

        {/* Content */}
        <main
          className={`
            flex-1 min-h-screen
            transition-all duration-300
            ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
          `}
          role="main"
        >
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
