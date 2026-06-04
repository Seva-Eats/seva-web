'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { DeliveryLocation } from './types';

export type GeolocationPermission = 'granted' | 'denied' | 'prompt' | null;

type LocationContextType = {
  userLocation: DeliveryLocation | null;
  permissionStatus: GeolocationPermission;
  isLoading: boolean;
  refreshLocation: () => Promise<void>;
};

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [userLocation, setUserLocation] = useState<DeliveryLocation | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<GeolocationPermission>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshLocation = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setPermissionStatus('denied');
      setUserLocation(null);
      return;
    }

    setIsLoading(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      setPermissionStatus('granted');
      const { latitude, longitude } = position.coords;

      let address = 'Current location';
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        address = data.display_name ?? address;
      } catch {
        // keep default
      }

      setUserLocation({ latitude, longitude, address });
    } catch {
      setPermissionStatus('denied');
      setUserLocation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshLocation();
  }, [refreshLocation]);

  const value = useMemo(
    () => ({
      userLocation,
      permissionStatus,
      isLoading,
      refreshLocation,
    }),
    [userLocation, permissionStatus, isLoading, refreshLocation]
  );

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
