import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { PageLayout } from '@/components/layout/PageLayout';
import { Spinner } from '@/components/common/Spinner';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

// Lazy load pages for code splitting
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const SellerDashboard = lazy(() => import('@/pages/seller/dashboard/SellerDashboard'));
const ProductsPage = lazy(() => import('@/pages/seller/products/ProductsPage'));
const SalesPage = lazy(() => import('@/pages/seller/sales/SalesPage'));
const AnalyticsPage = lazy(() => import('@/pages/seller/analytics/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/seller/settings/SettingsPage'));
const BuyerDashboard = lazy(() => import('@/pages/buyer/qr-scanner/BuyerDashboard'));
const PurchasesPage = lazy(() => import('@/pages/buyer/purchases/PurchasesPage'));
const ProfilePage = lazy(() => import('@/pages/buyer/profile/ProfilePage'));
const HistoryPage = lazy(() => import('@/pages/buyer/history/HistoryPage'));
const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage'));
const ServerErrorPage = lazy(() => import('@/pages/error/ServerErrorPage'));

// Public pages
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const HelpPage = lazy(() => import('@/pages/public/HelpPage'));
const TermsPage = lazy(() => import('@/pages/public/TermsPage'));
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage'));
const ProductPublicPage = lazy(() => import('@/pages/public/ProductPublicPage'));

function SessionManager() {
  useSessionTimeout();
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SessionManager />
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <Suspense fallback={<Spinner />}>
                <PageLayout showHeader={false} showFooter={true}>
                  <LandingPage />
                </PageLayout>
              </Suspense>
            }
          />

          {/* Authentication Routes */}
          <Route
            path="/auth/login"
            element={
              <Suspense fallback={<Spinner />}>
                <PageLayout showHeader={false} showFooter={true}>
                  <LoginPage />
                </PageLayout>
              </Suspense>
            }
          />
          <Route
            path="/auth/register"
            element={
              <Suspense fallback={<Spinner />}>
                <PageLayout showHeader={false} showFooter={true}>
                  <RegisterPage />
                </PageLayout>
              </Suspense>
            }
          />

          {/* Seller Dashboard Routes */}
          <Route
            path="/seller/dashboard"
            element={
              <Suspense fallback={<Spinner />}>
                <ProtectedRoute allowedRoles={['user']}>
                  <SellerDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/seller/products"
            element={
              <Suspense fallback={<Spinner />}>
                <ProtectedRoute allowedRoles={['user']}>
                  <ProductsPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/seller/sales"
            element={
              <Suspense fallback={<Spinner />}>
                <ProtectedRoute allowedRoles={['user']}>
                  <SalesPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/seller/analytics"
            element={
              <Suspense fallback={<Spinner />}>
                <ProtectedRoute allowedRoles={['user']}>
                  <AnalyticsPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/seller/settings"
            element={
              <Suspense fallback={<Spinner />}>
                <ProtectedRoute allowedRoles={['user']}>
                  <SettingsPage />
                </ProtectedRoute>
              </Suspense>
            }
          />

          {/* Buyer Dashboard Routes */}
          <Route
            path="/buyer/qr-scanner"
            element={
              <Suspense fallback={<Spinner />}>
                <ProtectedRoute allowedRoles={['user']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/buyer/purchases"
            element={
              <Suspense fallback={<Spinner />}>
                <ProtectedRoute allowedRoles={['user']}>
                  <PurchasesPage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/buyer/profile"
            element={
              <Suspense fallback={<Spinner />}>
                <ProtectedRoute allowedRoles={['user']}>
                  <ProfilePage />
                </ProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/buyer/history"
            element={
              <Suspense fallback={<Spinner />}>
                <ProtectedRoute allowedRoles={['user']}>
                  <HistoryPage />
                </ProtectedRoute>
              </Suspense>
            }
          />


          {/* Public Pages */}
          <Route
            path="/about"
            element={
              <Suspense fallback={<Spinner />}>
                <AboutPage />
              </Suspense>
            }
          />
          <Route
            path="/contact"
            element={
              <Suspense fallback={<Spinner />}>
                <ContactPage />
              </Suspense>
            }
          />
          <Route
            path="/help"
            element={
              <Suspense fallback={<Spinner />}>
                <HelpPage />
              </Suspense>
            }
          />
          <Route
            path="/terms"
            element={
              <Suspense fallback={<Spinner />}>
                <TermsPage />
              </Suspense>
            }
          />
          <Route
            path="/privacy"
            element={
              <Suspense fallback={<Spinner />}>
                <PrivacyPage />
              </Suspense>
            }
          />
          <Route
            path="/product/:id"
            element={
              <Suspense fallback={<Spinner />}>
                <ProductPublicPage />
              </Suspense>
            }
          />

          {/* Error Routes */}
          <Route
            path="/500"
            element={
              <Suspense fallback={<Spinner />}>
                <ServerErrorPage />
              </Suspense>
            }
          />

          {/* Catch all - 404 */}
          <Route
            path="*"
            element={
              <Suspense fallback={<Spinner />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
