import type { UserRole } from '@/context/UserContext';

const USER_STORAGE_KEY = 'user-profile';

export function parseStoredRole(raw: string | undefined | null): UserRole {
  if (raw === 'dasher' || raw === 'volunteer') return 'dasher';
  return 'recipient';
}

/** Read role from localStorage (client-only). */
export function getStoredUserRole(): UserRole {
  if (typeof window === 'undefined') return 'recipient';
  try {
    const stored = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return 'recipient';
    const parsed = JSON.parse(stored) as { role?: string };
    return parseStoredRole(parsed.role);
  } catch {
    return 'recipient';
  }
}

export function getHomePathForRole(role: UserRole | undefined): string {
  return role === 'dasher' ? '/seva' : '/request/location';
}

export function getProfilePathForRole(role: UserRole | undefined): string {
  return role === 'dasher' ? '/seva/profile' : '/profile';
}

export function isVolunteerPath(pathname: string): boolean {
  return pathname === '/seva' || pathname.startsWith('/seva/');
}

export function isRecipientPath(pathname: string): boolean {
  return (
    pathname.startsWith('/request') ||
    pathname.startsWith('/requests')
  );
}

export function isSharedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/auth') ||
    pathname === '/' ||
    pathname.startsWith('/support') ||
    pathname.startsWith('/locations')
  );
}
