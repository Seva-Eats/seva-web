import { type NextRequest, NextResponse } from 'next/server';

import { ONBOARDING_COOKIE_KEY } from '@/constants/storage';
import { updateSession } from '@/lib/supabase/middleware';

const LATE_ONBOARDING_PATHS = [
  '/onboarding/sign-in',
  '/onboarding/email',
  '/onboarding/verify',
];

function isEarlyOnboarding(pathname: string) {
  return pathname === '/onboarding' || pathname.startsWith('/onboarding/slide');
}

function isPublicPath(pathname: string) {
  if (pathname === '/auth/callback') return true;
  if (isEarlyOnboarding(pathname)) return true;
  if (LATE_ONBOARDING_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest) {
  const { response: supabaseResponse, user } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.includes('.')) {
    return supabaseResponse;
  }

  if (pathname === '/auth/callback') {
    return supabaseResponse;
  }

  const onboarded = request.cookies.get(ONBOARDING_COOKIE_KEY)?.value === 'true';

  if (!onboarded && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  if (onboarded && isEarlyOnboarding(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = user ? '/request/location' : '/onboarding/sign-in';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
