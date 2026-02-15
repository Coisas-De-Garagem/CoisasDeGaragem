import { create } from 'zustand';
import type { Product, ProductFilters } from '@/types';

interface ProductsState {
  products: Product[];
  selectedProduct: Product | null;
  filters: ProductFilters;
  setProducts: (products: Product[]) => void;
  setSelectedProduct: (product: Product | null) => void;
  setFilters: (filters: ProductFilters) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

export const useProductsStore = create<ProductsState>()((set) => ({
  products: [],
  selectedProduct: null,
  filters: {
    page: 1,
    limit: 20,
  },
  setProducts: (products) => set({ products }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setFilters: (filters) => set({ filters }),
  addProduct: (product) =>
    set((state) => ({
      products: [...state.products, product],
    })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    })),
  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
}));
