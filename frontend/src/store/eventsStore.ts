import { create } from 'zustand';
import type { GarageEvent } from '@/types';

interface EventsState {
  events: GarageEvent[];
  selectedEvent: GarageEvent | null;
  setEvents: (events: GarageEvent[]) => void;
  setSelectedEvent: (event: GarageEvent | null) => void;
  addEvent: (event: GarageEvent) => void;
  updateEvent: (id: string, updates: Partial<GarageEvent>) => void;
  deleteEvent: (id: string) => void;
}

export const useEventsStore = create<EventsState>()((set) => ({
  events: [],
  selectedEvent: null,
  setEvents: (events) => set({ events }),
  setSelectedEvent: (event) => set({ selectedEvent: event }),
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events],
    })),
  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      selectedEvent:
        state.selectedEvent?.id === id ? { ...state.selectedEvent, ...updates } : state.selectedEvent,
    })),
  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
    })),
}));
