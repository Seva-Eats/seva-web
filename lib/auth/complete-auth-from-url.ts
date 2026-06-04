import { getSupabaseBrowserClient } from '@/lib/supabase/client';

type OtpType = 'signup' | 'magiclink' | 'recovery' | 'invite' | 'email' | 'email_change';

function parseHashParams(hashValue: string) {
  const raw = hashValue.startsWith('#') ? hashValue.slice(1) : hashValue;
  return new URLSearchParams(raw);
}

function normalizeOtpType(value: string | null): OtpType | null {
  if (
    value === 'signup' ||
    value === 'magiclink' ||
    value === 'recovery' ||
    value === 'invite' ||
    value === 'email' ||
    value === 'email_change'
  ) {
    return value;
  }
  return null;
}

export async function completeAuthFromUrl(urlString: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return false;

  const queue = [urlString, decodeURIComponent(urlString)];
  const seen = new Set<string>();
  const paramsList: URLSearchParams[] = [];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || seen.has(current)) {
      continue;
    }
    seen.add(current);

    let parsed: URL;
    try {
      parsed = new URL(current);
    } catch {
      continue;
    }

    paramsList.push(parsed.searchParams);

    const hashParams = parseHashParams(parsed.hash);
    if (hashParams.toString().length > 0) {
      paramsList.push(hashParams);
    }

    for (const key of ['redirect_to', 'redirectTo', 'next', 'redirect_url', 'redirectUrl']) {
      const nested = parsed.searchParams.get(key) ?? hashParams.get(key);
      if (nested && nested.includes('://')) {
        queue.push(nested);
      }
    }
  }

  const getParam = (key: string) => {
    for (const params of paramsList) {
      const value = params.get(key);
      if (value) return value;
    }
    return null;
  };

  const code = getParam('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return true;
  }

  const accessToken = getParam('access_token');
  const refreshToken = getParam('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return true;
  }

  const tokenHash = getParam('token_hash');
  const otpType = normalizeOtpType(getParam('type'));
  if (tokenHash && otpType) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (error) throw error;
    return true;
  }

  return false;
}

export function getAuthRedirectUrl() {
  if (typeof window === 'undefined') {
    return '/auth/callback';
  }
  const url = `${window.location.origin}/auth/callback`;
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

export async function getCurrentSession() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session ?? null;
}

export function isNetworkTimeoutError(error: unknown) {
  if (!(error instanceof Error)) return false;
  const message = `${error.name} ${error.message}`.toLowerCase();
  return message.includes('network request timed out') || message.includes('timed out');
}

export { hasSupabaseConfig } from '@/lib/supabase/env';
