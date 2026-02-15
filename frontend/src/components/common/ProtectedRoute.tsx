import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'admin')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If user has 'user' role, they can access both buyer and seller routes
  // If user has 'admin' role, they can access everything
  if (user && (user.role === 'user' || user.role === 'admin')) {
    return <>{children}</>;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Legacy support or fallback logic
    const redirectPath = '/buyer/qr-scanner';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
