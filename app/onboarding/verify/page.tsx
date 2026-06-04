'use client';

import type { User } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import BackNavButton from '@/components/onboarding/BackNavButton';
import { ONBOARDING_COLORS } from '@/constants/onboarding';
import { useUser } from '@/context';
import {
  getAuthRedirectUrl,
  getCurrentSession,
  hasSupabaseConfig,
  isNetworkTimeoutError,
} from '@/lib/auth/complete-auth-from-url';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { getHomePathForRole, getStoredUserRole } from '@/lib/navigation/role-paths';
import { setOnboardingCompleted } from '@/lib/storage';

const CODE_LENGTH = 6;

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = (params.get('email') ?? '').toLowerCase();
  const mode = params.get('mode') === 'signup' ? 'signup' : 'signin';
  const { mockSignIn, user } = useUser();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const finishEmailAuth = async (authUserOverride?: User | null) => {
    const session = authUserOverride ? null : await getCurrentSession();
    const authUser = authUserOverride ?? session?.user;
    if (!authUser) throw new Error('No active session after verification');

    await mockSignIn('email', {
      name:
        typeof authUser.user_metadata?.full_name === 'string'
          ? authUser.user_metadata.full_name
          : (authUser.email?.split('@')[0] ?? user?.name),
      email: authUser.email,
    });
    await setOnboardingCompleted(true);
    router.replace(getHomePathForRole(getStoredUserRole()));
  };

  const handleVerifyCode = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !hasSupabaseConfig) {
      alert('Supabase not configured.');
      return;
    }
    if (!email) {
      alert('Missing email: Go back and enter your email again.');
      return;
    }

    const token = code.trim().replace(/\s+/g, '');
    if (token.length !== CODE_LENGTH) {
      alert('Invalid code: Enter the verification code from your email.');
      return;
    }

    setIsLoading(true);
    try {
      let verifiedUser: User | null | undefined = null;
      const primaryType = mode === 'signup' ? 'signup' : 'email';
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: primaryType,
      });

      if (error) {
        if (primaryType !== 'email') {
          const emailFallback = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
          });
          if (!emailFallback.error) {
            verifiedUser = emailFallback.data?.user ?? null;
          }
        }
        if (!verifiedUser) {
          const magicFallback = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'magiclink',
          });
          if (magicFallback.error) throw magicFallback.error;
          verifiedUser = magicFallback.data?.user ?? null;
        }
      } else {
        verifiedUser = data?.user ?? null;
      }

      setIsVerified(true);
      await new Promise((r) => setTimeout(r, 800));
      await finishEmailAuth(verifiedUser ?? undefined);
    } catch (error) {
      setIsVerified(false);
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (message.includes('expired') || message.includes('invalid') || message.includes('token')) {
        alert('Code expired: Request a new email and enter the newest verification code.');
      } else {
        alert('Could not verify code. Please try again in a moment.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !hasSupabaseConfig) return;
    if (!email) return;

    setIsResending(true);
    try {
      const redirectTo = getAuthRedirectUrl();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: mode === 'signup',
        },
      });
      if (error) throw error;
      alert('Email sent: A fresh verification email has been sent.');
      setCode('');
      setIsVerified(false);
    } catch (error) {
      if (isNetworkTimeoutError(error)) {
        alert('Network error: Could not reach the sign-in service.');
      } else {
        alert(
          `Unable to resend: ${error instanceof Error ? error.message : 'Please try again.'}`
        );
      }
    } finally {
      setIsResending(false);
    }
  };

  const isBusy = isLoading || isResending || isVerified;

  return (
    <AppShell className="bg-[#FAF3EB]">
      <div className="flex min-h-screen flex-col px-6 pb-8 pt-2">
        <BackNavButton onPress={() => router.back()} />
        <div className="mt-6">
          <p className="text-[11px] font-bold tracking-[1.2px] text-[#F07B2A]">VERIFY</p>
          <h1 className="mt-1 text-[28px] font-bold text-[#1A1A1A]">Enter verification code</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Enter the 6-digit code sent to {email || 'your email'}.
          </p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={CODE_LENGTH}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
            className="mt-6 w-full rounded-xl border border-[#E8E3DA] bg-white px-4 py-4 text-center text-2xl tracking-[0.3em] text-[#1A1A1A] outline-none focus:border-[#F07B2A]"
            disabled={isBusy}
          />

          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={isBusy}
            className="mt-4 flex min-h-[56px] w-full items-center justify-center rounded-[28px] text-[17px] font-bold text-white disabled:opacity-60"
            style={{ backgroundColor: ONBOARDING_COLORS.accent }}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={isBusy}
            className="mt-3 w-full text-center text-sm font-semibold text-[#F07B2A] disabled:opacity-60"
          >
            Resend email
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF3EB]" />}>
      <VerifyContent />
    </Suspense>
  );
}
