'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { useUser } from '@/context';
import { completeAuthFromUrl, getCurrentSession } from '@/lib/auth/complete-auth-from-url';
import { getHomePathForRole, getStoredUserRole } from '@/lib/navigation/role-paths';
import { setOnboardingCompleted } from '@/lib/storage';

function providerFromSession(session: Awaited<ReturnType<typeof getCurrentSession>>) {
  const provider = session?.user.app_metadata?.provider;
  if (provider === 'apple' || provider === 'google' || provider === 'email') {
    return provider;
  }
  return 'email' as const;
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const { mockSignIn } = useUser();
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const finish = async () => {
      try {
        const url =
          typeof window !== 'undefined'
            ? window.location.href
            : '';
        const completed = await completeAuthFromUrl(url);
        if (!completed) throw new Error('Missing Supabase auth callback parameters');

        let session = await getCurrentSession();
        if (!session?.user) {
          await new Promise((r) => setTimeout(r, 350));
          session = await getCurrentSession();
        }

        if (session?.user) {
          await mockSignIn(providerFromSession(session), {
            name:
              typeof session.user.user_metadata?.full_name === 'string'
                ? session.user.user_metadata.full_name
                : session.user.email?.split('@')[0],
            email: session.user.email,
          });
        }

        await setOnboardingCompleted(true);
        setStatus('done');
        router.replace(getHomePathForRole(getStoredUserRole()));
      } catch {
        setStatus('error');
      }
    };

    void finish();
  }, [mockSignIn, router]);

  return (
    <AppShell className="bg-[#FAF3EB]">
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        {status === 'error' ? (
          <>
            <h1 className="text-center text-[28px] font-bold leading-[34px] text-[#1A1A1A]">
              Link could not be verified
            </h1>
            <p className="mt-3 max-w-[320px] text-center text-sm leading-5 text-[#6B7280]">
              Open the latest email from Seva Eats and try again. Verification links expire after
              they are used.
            </p>
            <button
              type="button"
              onClick={() => router.replace('/onboarding/sign-in')}
              className="mt-4 min-w-[180px] rounded-[14px] bg-[#F07B2A] px-5 py-3 text-base font-bold text-white"
            >
              Back to sign in
            </button>
          </>
        ) : (
          <LoadingOverlay message={status === 'done' ? 'Verified!' : 'Finishing sign in...'} />
        )}
      </div>
    </AppShell>
  );
}
