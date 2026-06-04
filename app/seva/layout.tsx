'use client';

import type { ReactNode } from 'react';

import { VolunteerRouteProvider } from '@/context/VolunteerRouteContext';

export default function SevaLayout({ children }: { children: ReactNode }) {
  return <VolunteerRouteProvider>{children}</VolunteerRouteProvider>;
}
