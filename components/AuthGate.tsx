'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type ReactNode } from 'react';

import { ONBOARDING_STORAGE_KEY } from '@/constants/onboarding';
import { useUser } from '@/context';
import {
  getHomePathForRole,
  isRecipientPath,
  isVolunteerPath,
  isSharedPath,
} from '@/lib/navigation/role-paths';
import * as storage from '@/lib/storage';

const AUTH_PATHS = ['/auth/callback'];
const ONBOARDING_PREFIX = '/onboarding';

function isLateOnboardingRoute(pathname: string) {
  return (
    pathname.startsWith('/onboarding/sign-in') ||
    pathname.startsWith('/onboarding/email') ||
    pathname.startsWith('/onboarding/verify')
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: isUserLoading } = useUser();
  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  const refreshOnboarding = useCallback(async () => {
    try {
      const value = await storage.getItem(ONBOARDING_STORAGE_KEY);
      const completed = value === 'true';
      setHasOnboarded(completed);
      storage.syncOnboardingCookie(completed);
    } catch {
      setHasOnboarded(false);
      storage.syncOnboardingCookie(false);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshOnboarding();
  }, [refreshOnboarding]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === ONBOARDING_STORAGE_KEY) {
        void refreshOnboarding();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [refreshOnboarding]);

  useEffect(() => {
    if (!isReady || hasOnboarded === null || isUserLoading) return;

    const inOnboarding = pathname.startsWith(ONBOARDING_PREFIX);
    const inAuthCallback = AUTH_PATHS.some((p) => pathname.startsWith(p));
    const isAuthenticated = !!user?.isAuthenticated;

    if (!hasOnboarded && !inOnboarding && !inAuthCallback) {
      router.replace('/onboarding');
      return;
    }

    if (hasOnboarded && !isAuthenticated && !inOnboarding && !inAuthCallback) {
      router.replace('/onboarding/sign-in');
      return;
    }

    if (hasOnboarded && isAuthenticated && inOnboarding && isLateOnboardingRoute(pathname)) {
      router.replace(getHomePathForRole(user?.role));
      return;
    }

    if (hasOnboarded && isAuthenticated && user?.role && !isSharedPath(pathname)) {
      if (user.role === 'dasher' && isRecipientPath(pathname)) {
        router.replace('/seva');
        return;
      }
      if (user.role === 'recipient' && isVolunteerPath(pathname)) {
        router.replace('/request/location');
        return;
      }
      if (user.role === 'dasher' && pathname === '/profile') {
        router.replace('/seva/profile');
      }
    }
  }, [
    isReady,
    hasOnboarded,
    isUserLoading,
    pathname,
    router,
    user?.isAuthenticated,
    user?.role,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token')) return;
    if (pathname !== '/auth/callback') {
      router.replace(`/auth/callback${window.location.search}${hash}`);
    }
  }, [pathname, router]);

  if (!isReady || isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
