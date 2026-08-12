import { useCallback, useEffect, useState } from 'react';
import { api } from '@/services/api';
import { useLocationsStore } from '@/store/locationsStore';
import type { CreateLocationRequest, UpdateLocationRequest } from '@/types';

export function useLocations(options: { autoFetch?: boolean } = { autoFetch: true }) {
  const { locations, isLoading, error, hasFetched, setLocations, addLocation, updateLocation, setLoading, setError, setHasFetched } = useLocationsStore();

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getLocations();
      if (response.success) {
        setLocations(response.data);
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      setError('Erro ao carregar locais');
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setLocations, setError, setHasFetched]);

  useEffect(() => {
    if (options.autoFetch && !hasFetched && !isLoading) {
      fetchLocations();
    }
  }, [fetchLocations, hasFetched, isLoading, options.autoFetch]);

  const createLocation = async (data: CreateLocationRequest) => {
    const response = await api.createLocation(data);
    if (response.success) {
      addLocation(response.data);
      return response.data;
    }
    throw new Error(response.error.message);
  };

  const editLocation = async (id: string, data: UpdateLocationRequest) => {
    const response = await api.updateLocation(id, data);
    if (response.success) {
      updateLocation(id, response.data);
      return response.data;
    }
    throw new Error(response.error.message);
  };

  const toggleStatus = async (id: string) => {
    const response = await api.toggleLocationStatus(id);
    if (response.success) {
      updateLocation(id, response.data);
      return response.data;
    }
    throw new Error(response.error.message);
  };

  return {
    locations,
    isLoading,
    error,
    createLocation,
    editLocation,
    toggleStatus,
    refreshLocations: fetchLocations,
  };
}
