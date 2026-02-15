import { useCallback } from 'react';
import { usePurchasesStore } from '@/store/purchasesStore';
import { api } from '@/services/api';

export function usePurchases() {
  const {
    purchases,
    currentPurchase,
    filters,
    setPurchases,
    setCurrentPurchase,
    setFilters,
    addPurchase,
    updatePurchase,
  } = usePurchasesStore();

  const fetchPurchases = useCallback(
    async (newFilters?: typeof filters) => {
      const result = await api.getPurchases(newFilters || filters);

      if (result.success) {
        setPurchases(result.data.purchases);
      } else {
        throw new Error(result.error.message);
      }
    },
    [filters, setPurchases],
  );

  const fetchSales = useCallback(
    async (newFilters?: typeof filters) => {
      const result = await api.getSales(newFilters || filters);

      if (result.success) {
        setPurchases(result.data.purchases);
      } else {
        throw new Error(result.error.message);
      }
    },
    [filters, setPurchases],
  );

  const fetchPurchase = useCallback(
    async (id: string) => {
      const result = await api.getPurchase(id);

      if (result.success) {
        setCurrentPurchase(result.data);
      } else {
        throw new Error(result.error.message);
      }
    },
    [setCurrentPurchase],
  );

  const createPurchase = useCallback(
    async (data: {
      productId: string;
      qrCode: string;
      paymentMethod?: 'cash' | 'card' | 'pix' | 'other';
      notes?: string;
    }) => {
      const result = await api.createPurchase(data);

      if (result.success) {
        addPurchase(result.data);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    },
    [addPurchase],
  );

  const editPurchase = useCallback(
    async (id: string, updates: Partial<typeof purchases[0]>) => {
      updatePurchase(id, updates);
    },
    [updatePurchase],
  );

  return {
    purchases,
    currentPurchase,
    filters,
    fetchPurchases,
    fetchSales,
    fetchPurchase,
    createPurchase,
    editPurchase,
    setFilters,
    setCurrentPurchase,
  };
}
