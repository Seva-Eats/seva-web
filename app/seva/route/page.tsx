'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useVolunteerRoute } from '@/context/VolunteerRouteContext';
import { getContinueRoutePath } from '@/lib/volunteer-route/helpers';

/** Sends volunteers to the right step in the active route flow. */
export default function SevaRouteIndexPage() {
  const router = useRouter();
  const { route } = useVolunteerRoute();

  useEffect(() => {
    router.replace(getContinueRoutePath(route.phase, route));
  }, [route, router]);

  return null;
}
