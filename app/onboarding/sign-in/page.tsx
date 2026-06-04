'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import BackNavButton from '@/components/onboarding/BackNavButton';
import ProgressDots from '@/components/onboarding/ProgressDots';
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { ONBOARDING_COLORS } from '@/constants/onboarding';
import { useUser } from '@/context';
import { getAuthRedirectUrl, hasSupabaseConfig, isNetworkTimeoutError } from '@/lib/auth/complete-auth-from-url';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { setOnboardingCompleted } from '@/lib/storage';

type OAuthProvider = 'google' | 'apple';

const ORANGE = ONBOARDING_COLORS.accent;

const providerName: Record<OAuthProvider, string> = {
  google: 'Google',
  apple: 'Apple',
};

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export default function SignInPage() {
  const router = useRouter();
  const { mockSignIn, user } = useUser();
  const [isLoading, setIsLoading] = useState<OAuthProvider | null>(null);

  useEffect(() => {
    if (user?.isAuthenticated) {
      router.replace('/request/location');
    }
  }, [router, user?.isAuthenticated]);

  const completeSession = async (provider: OAuthProvider) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !hasSupabaseConfig) {
      alert(
        'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment.'
      );
      return;
    }

    setIsLoading(provider);
    const redirectTo = getAuthRedirectUrl();

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo },
      });

      if (error || !data?.url) {
        throw error ?? new Error('Unable to start OAuth flow');
      }

      window.location.href = data.url;
    } catch (error) {
      setIsLoading(null);
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
    router.replace('/request/location');
  };

  return (
    <AppShell>
      {isLoading && <LoadingOverlay message={`Signing in with ${providerName[isLoading]}...`} />}
      <div className="flex min-h-screen flex-col gap-4 px-6 pb-6 pt-2">
        <div className="flex items-center justify-between">
          <BackNavButton onPress={() => router.push('/onboarding/slide3')} />
          <ProgressDots total={4} current={3} />
          <div className="w-10" />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <div className="w-full max-w-[360px] text-center">
            <p className="text-[11px] font-bold tracking-[1.2px] text-[#F07B2A]">ACCOUNT</p>
            <h1 className="mt-1 text-[28px] font-bold leading-[34px] text-[#1A1A1A]">
              Sign in to continue
            </h1>
            <p className="mt-1 text-sm leading-5 text-[#6B7280]">
              Choose Apple, Google, or continue with email.
            </p>
          </div>

          <div className="w-full max-w-[360px] rounded-2xl border border-[#E8E3DA] bg-[#F7F4EF] p-3.5">
            <button
              type="button"
              onClick={() => completeSession('apple')}
              disabled={isLoading !== null}
              className="relative mb-2.5 flex min-h-[50px] w-full items-center justify-center rounded-[14px] border border-[#111] bg-[#111] text-[15px] font-bold text-white disabled:opacity-60 active:scale-[0.99]"
            >
              <span className="absolute left-[18px]">
                <AppleIcon />
              </span>
              {isLoading === 'apple' ? 'Please wait...' : 'Continue with Apple'}
            </button>

            <button
              type="button"
              onClick={() => completeSession('google')}
              disabled={isLoading !== null}
              className="relative flex min-h-[50px] w-full items-center justify-center rounded-[14px] border border-[#111] bg-white text-[15px] font-bold text-[#111] disabled:opacity-60 active:scale-[0.99]"
            >
              <span className="absolute left-[18px]">
                <GoogleIcon />
              </span>
              {isLoading === 'google' ? 'Please wait...' : 'Continue with Google'}
            </button>

            <button
              type="button"
              onClick={() => router.push('/onboarding/email?mode=signin')}
              disabled={isLoading !== null}
              className="mt-2.5 flex min-h-12 w-full items-center justify-center rounded-[28px] text-sm font-bold text-white disabled:opacity-60 active:scale-[0.99]"
              style={{ backgroundColor: ORANGE }}
            >
              Continue with Email
            </button>

            <div className="my-2 flex items-center gap-2">
              <div className="h-px flex-1 bg-[#E5E7EB]" />
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#6B7280]">
                or
              </span>
              <div className="h-px flex-1 bg-[#E5E7EB]" />
            </div>

            <button
              type="button"
              onClick={() => router.push('/onboarding/email?mode=signup')}
              disabled={isLoading !== null}
              className="flex min-h-[46px] w-full items-center justify-center rounded-[28px] border bg-transparent text-sm font-bold disabled:opacity-60 active:scale-[0.99]"
              style={{ borderColor: ORANGE, color: ORANGE }}
            >
              Sign Up with Email
            </button>

            <p className="mt-2 px-1 text-center text-xs leading-[18px] text-[#6B7280]">
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

        <p className="px-2 text-center text-xs leading-[18px] text-[#6B7280]">
          By continuing, you agree to use Seva Eats respectfully and follow local community
          guidelines.
        </p>
      </div>
    </AppShell>
  );
}
