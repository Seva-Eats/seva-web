'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { PageLoader } from '@/components/ui/PageLoader';
import { ONBOARDING_STORAGE_KEY } from '@/constants/onboarding';
import { useUser } from '@/context';
import { getHomePathForRole } from '@/lib/navigation/role-paths';
import * as storage from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) return;

    storage.getItem(ONBOARDING_STORAGE_KEY).then((value) => {
      const hasOnboarded = value === 'true';
      const isAuthenticated = !!user?.isAuthenticated;

      if (!hasOnboarded) {
        router.replace('/onboarding');
        return;
      }

      if (!isAuthenticated) {
        router.replace('/onboarding/sign-in');
        return;
      }

      router.replace(getHomePathForRole(user?.role));
    });
  }, [router, isUserLoading, user?.isAuthenticated, user?.role]);

  return <PageLoader message="Opening Seva Eats..." />;
}
