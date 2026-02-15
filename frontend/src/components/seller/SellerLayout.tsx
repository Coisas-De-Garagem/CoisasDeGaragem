import { SellerSidebar } from '@/components/seller/SellerSidebar';
// import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  //   const isMobile = useMediaQuery('(max-width: 1023px)');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Fixed */}
      <SellerSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Wrapper */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 lg:ml-64`}>
        {/* Mobile Header */}
        <header className="lg:hidden bg-white shadow-sm sticky top-0 z-30 px-4 py-4 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menu"
          >
            <FontAwesomeIcon icon={faBars} className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            Painel do Vendedor
          </h1>
          <div className="w-10"></div>
        </header>

        {/* Desktop Header */}
        {/* Desktop Header Removed as per user request */}
        {/* <header className="hidden lg:flex bg-white shadow-sm sticky top-0 z-30 px-8 py-4 justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Painel do Vendedor
          </h1>
          <div className="flex items-center gap-4">
            
          </div>
        </header> */}

        {/* Page Content */}
        <main className="p-4 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
