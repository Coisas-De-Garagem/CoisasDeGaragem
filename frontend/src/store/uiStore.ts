import { create } from 'zustand';
import type { Notification } from '@/types';

interface UIState {
  sidebarOpen: boolean;
  modalOpen: boolean;
  modalContent: React.ReactNode | null;
  loading: boolean;
  loadingMessage: string;
  notifications: Notification[];
  darkMode: boolean;
  setSidebarOpen: (open: boolean) => void;
  setModalOpen: (open: boolean, content?: React.ReactNode) => void;
  setLoading: (loading: boolean, message?: string) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  modalOpen: false,
  modalContent: null,
  loading: false,
  loadingMessage: '',
  notifications: [],
  darkMode: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setModalOpen: (open, content) =>
    set({
      modalOpen: open,
      modalContent: content || null,
    }),
  setLoading: (loading, message = '') =>
    set({
      loading,
      loadingMessage: message,
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  clearNotifications: () => set({ notifications: [] }),
  toggleDarkMode: () =>
    set((state) => {
      const newDarkMode = !state.darkMode;
      // Apply dark mode to document
      if (newDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
      return { darkMode: newDarkMode };
    }),
  setDarkMode: (darkMode) =>
    set(() => {
      // Apply dark mode to document
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
      return { darkMode };
    }),
}));
