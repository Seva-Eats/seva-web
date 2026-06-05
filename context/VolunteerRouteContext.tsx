'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  MOCK_VOLUNTEER_ROUTE,
  SEVA_ROUTE_STORAGE_KEY,
  type VolunteerActiveRoute,
  type VolunteerFlowPhase,
} from '@/constants/volunteer-deliveries';
import { countDeliveredStops, getActiveStop } from '@/lib/volunteer-route/helpers';

type VolunteerRouteContextValue = {
  route: VolunteerActiveRoute;
  activeStopId: string | undefined;
  startRoute: () => void;
  advancePickup: () => void;
  advanceStop: () => void;
  resetRoute: () => void;
};

const VolunteerRouteContext = createContext<VolunteerRouteContextValue | null>(null);

function persistRoute(route: VolunteerActiveRoute) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SEVA_ROUTE_STORAGE_KEY, JSON.stringify(route));
  } catch {
    // no-op
  }
}

function mergeRouteWithDefaults(route: VolunteerActiveRoute): VolunteerActiveRoute {
  const mockStops = new Map(MOCK_VOLUNTEER_ROUTE.stops.map((s) => [s.id, s]));
  return {
    ...MOCK_VOLUNTEER_ROUTE,
    ...route,
    pickupLatitude: route.pickupLatitude ?? MOCK_VOLUNTEER_ROUTE.pickupLatitude,
    pickupLongitude: route.pickupLongitude ?? MOCK_VOLUNTEER_ROUTE.pickupLongitude,
    stops: route.stops.map((stop) => {
      const fallback = mockStops.get(stop.id);
      return {
        ...stop,
        latitude: stop.latitude ?? fallback?.latitude ?? MOCK_VOLUNTEER_ROUTE.pickupLatitude,
        longitude: stop.longitude ?? fallback?.longitude ?? MOCK_VOLUNTEER_ROUTE.pickupLongitude,
      };
    }),
  };
}

function normalizeRoute(route: VolunteerActiveRoute): VolunteerActiveRoute {
  const merged = mergeRouteWithDefaults(route);
  if (merged.phase) return merged;
  if (merged.status === 'completed') {
    return { ...merged, phase: 'route_done' };
  }
  if (merged.status === 'in_progress') {
    const hasEnRoute = merged.stops.some((s) => s.status === 'en_route');
    const allPending = merged.stops.every((s) => s.status === 'pending');
    if (allPending) return { ...merged, phase: 'pickup_drive' };
    if (hasEnRoute) return { ...merged, phase: 'stop_drive' };
    return { ...merged, phase: 'pickup_arrived' };
  }
  return { ...merged, phase: 'idle' };
}

function loadStoredRoute(): VolunteerActiveRoute | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SEVA_ROUTE_STORAGE_KEY);
    if (!raw) return null;
    return normalizeRoute(JSON.parse(raw) as VolunteerActiveRoute);
  } catch {
    return null;
  }
}

function withPhase(
  route: VolunteerActiveRoute,
  phase: VolunteerFlowPhase,
  patch: Partial<VolunteerActiveRoute> = {}
): VolunteerActiveRoute {
  return { ...route, phase, ...patch };
}

function setFirstStopEnRoute(route: VolunteerActiveRoute): VolunteerActiveRoute {
  const idx = route.stops.findIndex((s) => s.status === 'pending');
  if (idx < 0) return route;
  return {
    ...route,
    stops: route.stops.map((s, i) =>
      i === idx ? { ...s, status: 'en_route' as const } : s
    ),
  };
}

function markActiveStopDelivered(route: VolunteerActiveRoute): VolunteerActiveRoute {
  const delivered = countDeliveredStops(route) + 1;
  const stops = route.stops.map((s) =>
    s.status === 'en_route' ? { ...s, status: 'delivered' as const } : s
  );
  const nextIdx = stops.findIndex((s) => s.status === 'pending');
  const withDeliveries = {
    ...route,
    completedStops: delivered,
    stops:
      nextIdx >= 0
        ? stops.map((s, i) => (i === nextIdx ? { ...s, status: 'en_route' as const } : s))
        : stops,
  };

  if (nextIdx < 0) {
    return withPhase(withDeliveries, 'route_done', { status: 'completed' });
  }
  return withPhase(withDeliveries, 'stop_drive', { status: 'in_progress' });
}

export function VolunteerRouteProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<VolunteerActiveRoute>(MOCK_VOLUNTEER_ROUTE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStoredRoute();
    if (stored) setRoute(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistRoute(route);
  }, [route, hydrated]);

  const update = useCallback((updater: (prev: VolunteerActiveRoute) => VolunteerActiveRoute) => {
    setRoute((prev) => updater(prev));
  }, []);

  const startRoute = useCallback(() => {
    update((prev) =>
      withPhase({ ...prev, status: 'in_progress' }, 'pickup_drive')
    );
  }, [update]);

  const advancePickup = useCallback(() => {
    update((prev) => {
      if (prev.phase === 'pickup_drive') {
        return withPhase(prev, 'pickup_arrived');
      }
      if (prev.phase === 'pickup_arrived') {
        return withPhase(setFirstStopEnRoute(prev), 'stop_drive');
      }
      return prev;
    });
  }, [update]);

  const advanceStop = useCallback(() => {
    update((prev) => {
      if (prev.phase === 'stop_drive') {
        return withPhase(prev, 'stop_arrived');
      }
      if (prev.phase === 'stop_arrived') {
        return withPhase(prev, 'stop_deliver');
      }
      if (prev.phase === 'stop_deliver') {
        return markActiveStopDelivered(prev);
      }
      return prev;
    });
  }, [update]);

  const resetRoute = useCallback(() => {
    setRoute(MOCK_VOLUNTEER_ROUTE);
    persistRoute(MOCK_VOLUNTEER_ROUTE);
  }, []);

  const activeStopId = useMemo(() => getActiveStop(route)?.id, [route]);

  const value = useMemo(
    () => ({
      route,
      activeStopId,
      startRoute,
      advancePickup,
      advanceStop,
      resetRoute,
    }),
    [route, activeStopId, startRoute, advancePickup, advanceStop, resetRoute]
  );

  return (
    <VolunteerRouteContext.Provider value={value}>{children}</VolunteerRouteContext.Provider>
  );
}

export function useVolunteerRoute() {
  const ctx = useContext(VolunteerRouteContext);
  if (!ctx) {
    throw new Error('useVolunteerRoute must be used within VolunteerRouteProvider');
  }
  return ctx;
}
