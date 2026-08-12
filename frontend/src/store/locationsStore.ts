import { create } from 'zustand';
import type { Location } from '@/types';

interface LocationsState {
  locations: Location[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  setLocations: (locations: Location[]) => void;
  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasFetched: (hasFetched: boolean) => void;
}

export const useLocationsStore = create<LocationsState>((set) => ({
  locations: [],
  isLoading: false,
  error: null,
  hasFetched: false,
  setLocations: (locations) => set({ locations, error: null, hasFetched: true }),
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
  setHasFetched: (hasFetched) => set({ hasFetched }),
}));
