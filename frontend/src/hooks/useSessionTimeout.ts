import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function useSessionTimeout() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = useCallback(() => {
        logout();
        navigate('/auth/login');
        // Optional: Show toast "Session expired"
    }, [logout, navigate]);

    useEffect(() => {
        if (!isAuthenticated) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        const resetTimeout = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(handleLogout, SESSION_TIMEOUT_MS);
        };

        // Events to monitor
        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];

        // Add listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimeout);
        });

        // Initialize timer
        resetTimeout();

        // Cleanup
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => {
                window.removeEventListener(event, resetTimeout);
            });
        };
    }, [isAuthenticated, handleLogout]);
}
