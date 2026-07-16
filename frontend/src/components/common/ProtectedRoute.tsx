import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: ('user' | 'admin')[];
}

/**
 * Guarda de rota. Aceita `children` ou, preferencialmente, ser usado como
 * elemento pai de uma rota aninhada (renderiza o <Outlet/> via children).
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Usuário "user" acessa tanto rotas de comprador quanto de vendedor.
  // "admin" acessa tudo.
  if (user && (user.role === 'user' || user.role === 'admin')) {
    return <>{children}</>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/buyer/qr-scanner" replace />;
  }

  return <>{children}</>;
}
