import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { ToastContainer } from '@/components/common/ToastContainer';
import { PendingReviewsNotifier } from '@/components/reviews/PendingReviewsNotifier';
import type { DashboardType } from '@/types';

interface AppShellProps {
  mode: DashboardType;
}

/**
 * Envoltório de todas as páginas autenticadas (comprador/vendedor).
 * - Desktop: sidebar lateral fixa + conteúdo com offset.
 * - Mobile: top bar enxuta + bottom navigation.
 * O conteúdo vem do <Outlet/> (rotas aninhadas).
 */
export function AppShell({ mode }: AppShellProps) {
  const location = useLocation();

  // Título dinâmico para o mobile, derivado da rota atual.
  const title = deriveTitle(mode, location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mode={mode} />

      {/* Conteúdo com offset da sidebar no desktop */}
      <div className="transition-[padding] duration-300 md:pl-20">
        <TopBar mode={mode} title={title} />
        <main className="px-4 sm:px-6 py-6 pb-24 md:pb-10 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>

      <BottomNav mode={mode} />
      <ToastContainer />
      <PendingReviewsNotifier />
    </div>
  );
}

function deriveTitle(mode: DashboardType, pathname: string): string {
  const map: Record<string, string> = {
    '/seller/dashboard': 'Vendedor',
    '/seller/products': 'Produtos',
    '/seller/sales': 'Vendas',
    '/seller/qr-codes': 'QR Codes',
    '/seller/analytics': 'Estatísticas',
    '/seller/events': 'Eventos',
    '/seller/profile': 'Perfil',
    '/buyer/qr-scanner': 'Explorar',
    '/buyer/purchases': 'Minhas Compras',
    '/buyer/history': 'Histórico',
    '/buyer/profile': 'Perfil',
  };
  return map[pathname] ?? (mode === 'seller' ? 'Vendedor' : 'Comprador');
}
