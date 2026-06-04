import type {
  VolunteerActiveRoute,
  VolunteerFlowPhase,
  VolunteerRouteStop,
} from '@/constants/volunteer-deliveries';

export function formatStopAddress(stop: VolunteerRouteStop): string {
  return `${stop.addressLine}, ${stop.city}`;
}

export function buildMapsDirectionsUrl(destination: string): string {
  const query = encodeURIComponent(destination);
  return `https://www.google.com/maps/dir/?api=1&destination=${query}`;
}

export function getActiveStop(route: VolunteerActiveRoute): VolunteerRouteStop | undefined {
  return (
    route.stops.find((s) => s.status === 'en_route') ??
    route.stops.find((s) => s.status === 'pending')
  );
}

export function countDeliveredStops(route: VolunteerActiveRoute): number {
  return route.stops.filter((s) => s.status === 'delivered').length;
}

/** Where the volunteer should land to continue their shift. */
export function getContinueRoutePath(
  phase: VolunteerFlowPhase,
  route: VolunteerActiveRoute
): string {
  if (phase === 'route_done' || route.status === 'completed') {
    return '/seva/route/complete';
  }
  if (phase === 'idle' || phase === 'pickup_drive' || phase === 'pickup_arrived') {
    return '/seva/route/pickup';
  }
  const stop = getActiveStop(route);
  if (stop) {
    return `/seva/route/stop/${stop.id}`;
  }
  return '/seva/route/complete';
}
