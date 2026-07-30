import type { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ToastContainer } from '@/components/common/ToastContainer';

interface PageLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

/**
 * Layout para páginas públicas (landing, auth, institucionais, erros).
 * As páginas autenticadas usam o <AppShell/> em vez deste.
 */
export function PageLayout({
  children,
  showHeader = true,
  showFooter = true,
  className = '',
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-background ${className}`}>
      {showHeader && <Header />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      <ToastContainer />
    </div>
  );
}
