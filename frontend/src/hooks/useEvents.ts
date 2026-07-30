import { useCallback } from 'react';
import { useEventsStore } from '@/store/eventsStore';
import { api } from '@/services/api';
import type { CreateEventRequest, UpdateEventRequest, EventInsights } from '@/types';

export function useEvents() {
  const {
    events,
    selectedEvent,
    setEvents,
    setSelectedEvent,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useEventsStore();

  const fetchEvents = useCallback(async () => {
    const result = await api.getEvents();
    if (result.success) {
      setEvents(result.data);
    } else {
      throw new Error(result.error.message);
    }
  }, [setEvents]);

  const fetchEvent = useCallback(
    async (id: string) => {
      const result = await api.getEvent(id);
      if (result.success) {
        setSelectedEvent(result.data);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    },
    [setSelectedEvent],
  );

  const createEvent = useCallback(
    async (data: CreateEventRequest) => {
      const result = await api.createEvent(data);
      if (result.success) {
        addEvent(result.data);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    },
    [addEvent],
  );

  const editEvent = useCallback(
    async (id: string, updates: UpdateEventRequest) => {
      const result = await api.updateEvent(id, updates);
      if (result.success) {
        updateEvent(id, result.data);
        return result.data;
      } else {
        throw new Error(result.error.message);
      }
    },
    [updateEvent],
  );

  const removeEvent = useCallback(
    async (id: string) => {
      const result = await api.deleteEvent(id);
      if (result.success) {
        deleteEvent(id);
      } else {
        throw new Error(result.error.message);
      }
    },
    [deleteEvent],
  );

  const linkProduct = useCallback(
    async (eventId: string, productId: string) => {
      const result = await api.linkProductToEvent(eventId, productId);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    [],
  );

  const unlinkProduct = useCallback(
    async (eventId: string, productId: string) => {
      const result = await api.unlinkProductFromEvent(eventId, productId);
      if (!result.success) {
        throw new Error(result.error.message);
      }
      return result.data;
    },
    [],
  );

  const fetchInsights = useCallback(async (eventId: string): Promise<EventInsights> => {
    const result = await api.getEventInsights(eventId);
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.error.message);
    }
  }, []);

  return {
    events,
    selectedEvent,
    fetchEvents,
    fetchEvent,
    createEvent,
    editEvent,
    removeEvent,
    linkProduct,
    unlinkProduct,
    fetchInsights,
    setEvents,
    setSelectedEvent,
  };
}
