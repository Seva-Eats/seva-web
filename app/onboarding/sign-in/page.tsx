'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import BackNavButton from '@/components/onboarding/BackNavButton';
import ProgressDots from '@/components/onboarding/ProgressDots';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import { ONBOARDING_COLORS } from '@/constants/onboarding';
import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';
import { useUser } from '@/context';
import { getAuthRedirectUrl, hasSupabaseConfig, isNetworkTimeoutError } from '@/lib/auth/complete-auth-from-url';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getHomePathForRole, getStoredUserRole } from '@/lib/navigation/role-paths';
import { setOnboardingCompleted } from '@/lib/storage';

const ORANGE = ONBOARDING_COLORS.accent;

export default function SignInPage() {
  const router = useRouter();
  const { mockSignIn, user } = useUser();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    if (user?.isAuthenticated) {
      router.replace(getHomePathForRole(user.role));
    }
  }, [router, user?.isAuthenticated, user?.role]);

  const completeGoogleSession = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !hasSupabaseConfig) {
      alert(
        'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel, then redeploy.'
      );
      return;
    }

    setIsGoogleLoading(true);
    const redirectTo = getAuthRedirectUrl();

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      });

      if (error || !data?.url) {
        throw error ?? new Error('Unable to start OAuth flow');
      }

      window.location.href = data.url;
    } catch (error) {
      setIsGoogleLoading(false);
      if (isNetworkTimeoutError(error)) {
        alert(
          'Network error: Could not reach the sign-in service. Check your connection and try again.'
        );
        return;
      }
      alert('Sign in failed. Please try again.');
    }
  };

  const handleGuest = async () => {
    await mockSignIn('guest', { name: 'Guest User' });
    await setOnboardingCompleted(true);
    router.replace(getHomePathForRole(getStoredUserRole()));
  };

  return (
    <AppShell>
      {isGoogleLoading && <LoadingOverlay message="Signing in with Google..." />}
      <div className="flex min-h-screen flex-col gap-4 px-6 pb-6 pt-2">
        <div className="flex items-center justify-between">
          <BackNavButton onPress={() => router.push('/onboarding/slide3')} />
          <ProgressDots total={4} current={3} />
          <div className="w-10" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="w-full max-w-[360px] text-center">
            <p className={cn(TypeClass.signInEyebrow, 'text-[#F07B2A]')}>ACCOUNT</p>
            <h1 className={cn(TypeClass.signInTitle, 'mt-1 text-[#1A1A1A]')}>Sign in to continue</h1>
            <p className={cn(TypeClass.signInSubtitle, 'mt-1 text-[#6B7280]')}>
              Choose Google or continue with email.
            </p>
          </div>

          <div className="w-full max-w-[360px] rounded-2xl border border-[#E8E3DA] bg-[#F7F4EF] p-3.5">
            <button
              type="button"
              onClick={completeGoogleSession}
              disabled={isGoogleLoading}
              className={cn(
                TypeClass.authBtn,
                'relative flex min-h-[50px] w-full items-center justify-center rounded-[14px] border border-[#111] bg-white text-[#111] disabled:opacity-60 active:scale-[0.99]'
              )}
            >
              <span className="absolute left-[18px]">
                <GoogleIcon />
              </span>
              {isGoogleLoading ? 'Please wait...' : 'Continue with Google'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/onboarding/email?mode=signin')}
              disabled={isGoogleLoading}
              className={cn(
                TypeClass.onboardCta,
                'mt-2.5 flex min-h-12 w-full items-center justify-center rounded-[28px] text-white disabled:opacity-60 active:scale-[0.99]'
              )}
              style={{ backgroundColor: ORANGE }}
            >
              Continue with Email
            </button>

            <div className="my-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-[#E5E7EB]" />
              <span
                className={cn(
                  TypeClass.captionXs,
                  'font-semibold uppercase tracking-wide text-[#6B7280]'
                )}
              >
                or
              </span>
              <div className="h-px flex-1 bg-[#E5E7EB]" />
            </div>

            <button
              type="button"
              onClick={() => router.push('/onboarding/email?mode=signup')}
              disabled={isGoogleLoading}
              className={cn(
                TypeClass.body,
                'flex min-h-[46px] w-full items-center justify-center rounded-[28px] border bg-transparent font-bold disabled:opacity-60 active:scale-[0.99]'
              )}
              style={{ borderColor: ORANGE, color: ORANGE }}
            >
              Sign Up with Email
            </button>

            <p className={cn(TypeClass.caption, 'mt-2 px-1 text-center text-[#6B7280]')}>
              Password sign-in continues on the next page.
            </p>

            <button
              type="button"
              onClick={handleGuest}
              className="mt-3 w-full text-center text-xs font-semibold text-[#6B7280] underline"
            >
              Continue as guest
            </button>
          </div>
        </div>

        <p className={cn(TypeClass.caption, 'px-2 text-center text-[#6B7280]')}>
          By continuing, you agree to use Seva Eats respectfully and follow local community
          guidelines.
        </p>
      </div>
    </AppShell>
  );
}
