import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Alert } from './Alert';

/**
 * Centro de notificações (toasts). Fixo no canto inferior direito no desktop
 * e acima da bottom nav no mobile, para não cobrir a navegação.
 */
export function ToastContainer() {
  const { notifications, removeNotification } = useUIStore();

  useEffect(() => {
    const timers = notifications.map((notification) =>
      setTimeout(() => removeNotification(notification.id), 5000),
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [notifications, removeNotification]);

  return (
    <div className="fixed z-[60] flex flex-col gap-2 pointer-events-none left-3 right-3 bottom-20 sm:bottom-auto sm:left-auto sm:right-4 sm:top-4 sm:bottom-4 sm:w-96">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto animate-slide-up sm:animate-fade-in-up"
        >
          <Alert
            variant={notification.type}
            dismissible
            onDismiss={() => removeNotification(notification.id)}
            title={notification.title}
          >
            {notification.message}
          </Alert>
        </div>
      ))}
    </div>
  );
}
