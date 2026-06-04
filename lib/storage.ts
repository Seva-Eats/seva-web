import { ONBOARDING_COOKIE_KEY } from '@/constants/storage';

export { ONBOARDING_COOKIE_KEY };

export async function getItem(key: string): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export async function setItem(key: string, value: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // no-op
  }
}

export async function removeItem(key: string): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // no-op
  }
}

export function syncOnboardingCookie(completed: boolean) {
  if (typeof document === 'undefined') return;
  if (completed) {
    document.cookie = `${ONBOARDING_COOKIE_KEY}=true; path=/; max-age=31536000; SameSite=Lax`;
  } else {
    document.cookie = `${ONBOARDING_COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
  }
}

export async function setOnboardingCompleted(completed: boolean) {
  const { ONBOARDING_STORAGE_KEY } = await import('@/constants/onboarding');
  if (completed) {
    await setItem(ONBOARDING_STORAGE_KEY, 'true');
  } else {
    await removeItem(ONBOARDING_STORAGE_KEY);
  }
  syncOnboardingCookie(completed);
}
