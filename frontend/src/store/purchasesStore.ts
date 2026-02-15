import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Purchase, PurchaseFilters } from '@/types';

interface PurchasesState {
  purchases: Purchase[];
  currentPurchase: Purchase | null;
  filters: PurchaseFilters;
  setPurchases: (purchases: Purchase[]) => void;
  setCurrentPurchase: (purchase: Purchase | null) => void;
  setFilters: (filters: PurchaseFilters) => void;
  addPurchase: (purchase: Purchase) => void;
  updatePurchase: (id: string, updates: Partial<Purchase>) => void;
}

export const usePurchasesStore = create<PurchasesState>()(
  persist(
    (set) => ({
      purchases: [],
      currentPurchase: null,
      filters: {
        page: 1,
        limit: 20,
      },
      setPurchases: (purchases) => set({ purchases }),
      setCurrentPurchase: (purchase) => set({ currentPurchase: purchase }),
      setFilters: (filters) => set({ filters }),
      addPurchase: (purchase) =>
        set((state) => ({
          purchases: [...state.purchases, purchase],
        })),
      updatePurchase: (id, updates) =>
        set((state) => ({
          purchases: state.purchases.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),
    }),
    {
      name: 'purchases-storage',
      partialize: (state) => ({
        purchases: state.purchases,
        currentPurchase: state.currentPurchase,
        filters: state.filters,
      }),
    },
  ),
);
