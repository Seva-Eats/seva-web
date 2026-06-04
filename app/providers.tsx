'use client';

import type { ReactNode } from 'react';

import { AuthGate } from '@/components/AuthGate';
import { LocationProvider, RequestProvider, ThemeProvider, UserProvider } from '@/context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <UserProvider>
        <LocationProvider>
          <RequestProvider>
            <AuthGate>{children}</AuthGate>
          </RequestProvider>
        </LocationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}
