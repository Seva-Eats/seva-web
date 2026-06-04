'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import BackNavButton from '@/components/onboarding/BackNavButton';
import { ONBOARDING_COLORS } from '@/constants/onboarding';
import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';
import { useUser } from '@/context';
import { hasSupabaseConfig, isNetworkTimeoutError } from '@/lib/auth/complete-auth-from-url';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { setOnboardingCompleted } from '@/lib/storage';

function EmailAuthContent() {
  const router = useRouter();
  const params = useSearchParams();
  const mode = params.get('mode') === 'signup' ? 'signup' : 'signin';
  const { mockSignIn } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailPasswordAuth = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !hasSupabaseConfig) {
      alert(
        'Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
      );
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      alert('Invalid email: Enter a valid email address to continue.');
      return;
    }

    if (password.trim().length < 6) {
      alert('Password too short: Use at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password.trim(),
        });

        if (signUpError) throw signUpError;

        let authUser = signUpData.user;
        if (!signUpData.session) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: trimmedEmail,
            password: password.trim(),
          });
          if (signInError) throw signInError;
          authUser = signInData.user;
        }

        await mockSignIn('email', {
          name:
            typeof authUser?.user_metadata?.full_name === 'string'
              ? authUser.user_metadata.full_name
              : authUser?.email?.split('@')[0],
          email: authUser?.email ?? trimmedEmail,
        });
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password.trim(),
        });
        if (error) throw error;

        const authUser = data.user;
        await mockSignIn('email', {
          name:
            typeof authUser?.user_metadata?.full_name === 'string'
              ? authUser.user_metadata.full_name
              : authUser?.email?.split('@')[0],
          email: authUser?.email ?? trimmedEmail,
        });
      }

      await setOnboardingCompleted(true);
      router.replace('/request/location');
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (
        mode === 'signin' &&
        (message.includes('invalid') || message.includes('credentials') || message.includes('login'))
      ) {
        alert('Incorrect details: Check your email and password and try again.');
        return;
      }
      if (mode === 'signup' && (message.includes('already') || message.includes('exists'))) {
        alert('Account already exists: Use Continue with Email to sign in.');
        return;
      }
      if (
        mode === 'signup' &&
        (message.includes('email not confirmed') || message.includes('email_not_confirmed'))
      ) {
        router.push(`/onboarding/verify?email=${encodeURIComponent(trimmedEmail)}&mode=signup`);
        return;
      }
      if (isNetworkTimeoutError(error)) {
        alert('Network error: Could not reach the sign-in service.');
        return;
      }
      alert(
        mode === 'signup'
          ? `Unable to sign up: ${error instanceof Error ? error.message : 'Please try again.'}`
          : `Unable to sign in: ${error instanceof Error ? error.message : 'Please try again.'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell className="bg-[#FAF3EB]">
      <div className="flex min-h-screen flex-col px-6 pb-8 pt-2">
        <BackNavButton onPress={() => router.push('/onboarding/sign-in')} />
        <div className="mt-6 flex flex-1 flex-col">
          <p className={cn(TypeClass.signInEyebrow, 'text-[#F07B2A]')}>EMAIL</p>
          <h1 className={cn(TypeClass.signInTitle, 'mt-1 text-[#1A1A1A]')}>
            {mode === 'signup' ? 'Create your account' : 'Sign in with email'}
          </h1>
          <p className={cn(TypeClass.signInSubtitle, 'mt-1 text-[#6B7280]')}>
            Enter your email and password to continue.
          </p>

          <div className="mt-6 rounded-2xl border border-[#E8E3DA] bg-[#F7F4EF] p-4">
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn('type-body-md w-full rounded-xl border border-[#E8E3DA] bg-white px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#F07B2A]')}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn('type-body-md w-full rounded-xl border border-[#E8E3DA] bg-white px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#F07B2A]')}
              />
            </div>

            <button
              type="button"
              onClick={handleEmailPasswordAuth}
              disabled={isLoading}
              className={cn(TypeClass.onboardCta, 'mt-4 flex min-h-[56px] w-full items-center justify-center rounded-[28px] text-white disabled:opacity-60')}
              style={{ backgroundColor: ONBOARDING_COLORS.accent }}
            >
              {isLoading ? 'Please wait...' : mode === 'signup' ? 'Create account' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function EmailAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF3EB]" />}>
      <EmailAuthContent />
    </Suspense>
  );
}
