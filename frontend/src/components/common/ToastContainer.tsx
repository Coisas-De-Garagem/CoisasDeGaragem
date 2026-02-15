import { useEffect } from 'react';
import { useUIStore } from '@/store/uiStore';
import { Alert } from './Alert';

export function ToastContainer() {
  const { notifications, removeNotification } = useUIStore();

  useEffect(() => {
    // Auto-remove notifications after 5 seconds
    const timers = notifications.map((notification) => {
      return setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [notifications, removeNotification]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="pointer-events-auto animate-in slide-in-from-right-4"
        >
          <Alert
            variant={notification.type}
            dismissible={true}
            onDismiss={() => removeNotification(notification.id)}
          >
            {notification.message}
          </Alert>
        </div>
      ))}
    </div>
  );
}
