import { create } from 'zustand';
import type { Location } from '@/types';

interface LocationsState {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  setLocations: (locations: Location[]) => void;
  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useLocationsStore = create<LocationsState>((set) => ({
  locations: [],
  isLoading: false,
  error: null,
  setLocations: (locations) => set({ locations, error: null }),
  addLocation: (location) =>
    set((state) => ({ locations: [location, ...state.locations] })),
  updateLocation: (id, updates) =>
    set((state) => ({
      locations: state.locations.map((loc) =>
        loc.id === id ? { ...loc, ...updates } : loc,
      ),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
