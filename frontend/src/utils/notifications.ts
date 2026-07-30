import { useUIStore } from '@/store/uiStore';
import type { Notification, NotificationType } from '@/types';

type AddNotificationFn = (notification: Notification) => void;

/**
 * Cria um helper `notify(type, title, message)` vinculado a uma função
 * `addNotification` do uiStore. Extrair para fora do componente evita o
 * falso-positivo do lint ("Cannot call impure function during render") ao
 * gerar o ID com Date.now().
 */
export function makeNotifier(addNotification: AddNotificationFn) {
  return (type: NotificationType, title: string, message: string) => {
    addNotification({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      userId: '',
      isRead: false,
    });
  };
}

/** Atalho para notificar a partir de qualquer lugar (mesmo fora de componente). */
export function notify(type: NotificationType, title: string, message: string) {
  makeNotifier(useUIStore.getState().addNotification)(type, title, message);
}
