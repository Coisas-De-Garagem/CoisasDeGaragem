import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/services/api';
import type { UserRole } from '@/types';

export function useAuth(options?: { redirect?: boolean }) {
  const { user, token, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const shouldRedirect = options?.redirect ?? true;

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      const result = await api.login({ email, password });

      if (result.success) {
        const { user: userData, token: userToken } = result.data;
        login(userData, userToken);
        localStorage.setItem('token', userToken);

        if (shouldRedirect) {
          // Redirect all users to buyer/qr-scanner (main hub)
          navigate('/buyer/qr-scanner', { replace: true });
        }
      } else {
        throw new Error(result.error.message);
      }
    },
    [login, navigate, shouldRedirect],
  );

  const handleRegister = useCallback(
    async (email: string, password: string, name: string, role: UserRole, phone?: string) => {
      const result = await api.register({ email, password, name, role, phone });

      if (result.success) {
        const { user: userData, token: userToken } = result.data;
        login(userData, userToken);
        localStorage.setItem('token', userToken);

        if (shouldRedirect) {
          // Redirect all users to buyer/qr-scanner (main hub)
          navigate('/buyer/qr-scanner', { replace: true });
        }
      } else {
        throw new Error(result.error.message);
      }
    },
    [login, navigate, shouldRedirect],
  );

  const handleGoogleLogin = useCallback(
    async (googleToken: string) => {
      const result = await api.googleLogin(googleToken);

      if (result.success) {
        const { user: userData, token: userToken } = result.data;
        login(userData, userToken);
        localStorage.setItem('token', userToken);

        if (shouldRedirect) {
          // Redirect all users to buyer/qr-scanner (main hub)
          navigate('/buyer/qr-scanner', { replace: true });
        }
      } else {
        throw new Error(result.error.message);
      }
    },
    [login, navigate, shouldRedirect],
  );

  const handleLogout = useCallback(() => {
    api.logout();
    logout();
    localStorage.removeItem('token');
    if (shouldRedirect) {
      navigate('/', { replace: true });
    }
  }, [logout, navigate, shouldRedirect]);

  const handleUpdateProfile = useCallback(
    async (updates: { name?: string; phone?: string; avatarUrl?: string }) => {
      if (!user) return;

      const result = await api.updateProfile(updates);

      if (result.success) {
        updateUser(result.data);
      } else {
        throw new Error(result.error.message);
      }
    },
    [user, updateUser],
  );

  return {
    user,
    token,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    loginWithGoogle: handleGoogleLogin,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
  };
}
