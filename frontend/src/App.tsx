import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/common/Spinner';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

// Seller
const SellerDashboard = lazy(() => import('@/pages/seller/dashboard/SellerDashboard'));
const ProductsPage = lazy(() => import('@/pages/seller/products/ProductsPage'));
const SalesPage = lazy(() => import('@/pages/seller/sales/SalesPage'));
const AnalyticsPage = lazy(() => import('@/pages/seller/analytics/AnalyticsPage'));
const QRCodesPage = lazy(() => import('@/pages/seller/qr-codes/QRCodesPage'));
const EventsPage = lazy(() => import('@/pages/seller/events/EventsPage'));
const EventFormPage = lazy(() => import('@/pages/seller/events/EventFormPage'));
const EventDetailPage = lazy(() => import('@/pages/seller/events/EventDetailPage'));

// Buyer
const BuyerDashboard = lazy(() => import('@/pages/buyer/qr-scanner/BuyerDashboard'));
const PurchasesPage = lazy(() => import('@/pages/buyer/purchases/PurchasesPage'));
const ProfilePage = lazy(() => import('@/pages/buyer/profile/ProfilePage'));
const HistoryPage = lazy(() => import('@/pages/buyer/history/HistoryPage'));

// Error
const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage'));
const ServerErrorPage = lazy(() => import('@/pages/error/ServerErrorPage'));

// Public
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const HelpPage = lazy(() => import('@/pages/public/HelpPage'));
const TermsPage = lazy(() => import('@/pages/public/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'));
const ProductPublicPage = lazy(() => import('@/pages/public/ProductPublicPage'));
const EventPublicPage = lazy(() => import('@/pages/public/EventPublicPage'));

function SessionManager() {
  useSessionTimeout();
  return null;
}

/** Wrapper de Suspense reutilizável. */
function Suspended({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-primary">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SessionManager />
        <Routes>
          {/* Landing */}
          <Route
            path="/"
            element={
              <Suspended>
                <PageLayout showHeader showFooter>
                  <LandingPage />
                </PageLayout>
              </Suspended>
            }
          />

          {/* Auth */}
          <Route
            path="/auth/login"
            element={
              <Suspended>
                <PageLayout showHeader={false} showFooter={false}>
                  <LoginPage />
                </PageLayout>
              </Suspended>
            }
          />
          <Route
            path="/auth/register"
            element={
              <Suspended>
                <PageLayout showHeader={false} showFooter={false}>
                  <RegisterPage />
                </PageLayout>
              </Suspended>
            }
          />

          {/* Painel do Vendedor — rotas aninhadas no AppShell */}
          <Route
            path="/seller"
            element={
              <ProtectedRoute>
                <AppShell mode="seller" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/seller/dashboard" />} />
            <Route path="dashboard" element={<Suspended><SellerDashboard /></Suspended>} />
            <Route path="products" element={<Suspended><ProductsPage /></Suspended>} />
            <Route path="sales" element={<Suspended><SalesPage /></Suspended>} />
            <Route path="qr-codes" element={<Suspended><QRCodesPage /></Suspended>} />
            <Route path="analytics" element={<Suspended><AnalyticsPage /></Suspended>} />
            <Route path="events" element={<Suspended><EventsPage /></Suspended>} />
            <Route path="events/new" element={<Suspended><EventFormPage /></Suspended>} />
            <Route path="events/:id" element={<Suspended><EventDetailPage /></Suspended>} />
            <Route path="events/:id/edit" element={<Suspended><EventFormPage /></Suspended>} />
            <Route path="profile" element={<Suspended><ProfilePage mode="seller" /></Suspended>} />
          </Route>

          {/* Painel do Comprador — rotas aninhadas no AppShell */}
          <Route
            path="/buyer"
            element={
              <ProtectedRoute>
                <AppShell mode="buyer" />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/buyer/qr-scanner" />} />
            <Route path="qr-scanner" element={<Suspended><BuyerDashboard /></Suspended>} />
            <Route path="purchases" element={<Suspended><PurchasesPage /></Suspended>} />
            <Route path="history" element={<Suspended><HistoryPage /></Suspended>} />
            <Route path="profile" element={<Suspended><ProfilePage mode="buyer" /></Suspended>} />
          </Route>

          {/* Páginas públicas */}
          <Route path="/about" element={<Suspended><PageLayout><AboutPage /></PageLayout></Suspended>} />
          <Route path="/contact" element={<Suspended><PageLayout><ContactPage /></PageLayout></Suspended>} />
          <Route path="/help" element={<Suspended><PageLayout><HelpPage /></PageLayout></Suspended>} />
          <Route path="/terms" element={<Suspended><PageLayout><TermsPage /></PageLayout></Suspended>} />
          <Route path="/privacy" element={<Suspended><PageLayout><PrivacyPage /></PageLayout></Suspended>} />
          <Route path="/product/:id" element={<Suspended><PageLayout><ProductPublicPage /></PageLayout></Suspended>} />
          <Route path="/event/:id" element={<Suspended><PageLayout showHeader><EventPublicPage /></PageLayout></Suspended>} />

          {/* Erros */}
          <Route path="/500" element={<Suspended><PageLayout showHeader showFooter={false}><ServerErrorPage /></PageLayout></Suspended>} />
          <Route path="*" element={<Suspended><PageLayout><NotFoundPage /></PageLayout></Suspended>} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

// Reexportado apenas para clareza do ponto de extensão das rotas aninhadas.
export { Outlet };

