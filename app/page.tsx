'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ONBOARDING_STORAGE_KEY } from '@/constants/onboarding';
import { useUser } from '@/context';
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

      router.replace('/request/location');
    });
  }, [router, isUserLoading, user?.isAuthenticated]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FFF8F0]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
    </div>
  );
}
