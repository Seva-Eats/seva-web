'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { AUTH_PROVIDER_LABELS } from '@/constants/auth';
import { useTheme, useUser } from '@/context';
import { useThemeColors } from '@/hooks/use-theme-colors';
import * as storage from '@/lib/storage';

const MAX_PHONE_DIGITS = 10;

const formatPhoneNumber = (value: string): string => {
  const digitsOnly = value.replace(/[^\d]/g, '').slice(0, MAX_PHONE_DIGITS);
  if (digitsOnly.length === 0) return '';
  if (digitsOnly.length <= 3) return `(${digitsOnly}`;
  if (digitsOnly.length <= 6) return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
  return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
};

export default function ProfilePage() {
  const router = useRouter();
  const colors = useThemeColors();
  const { themeMode, setThemeMode } = useTheme();
  const { user, updateProfile, clearProfile, signOut } = useUser();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.homeAddress?.address ?? '');
  const [servingSize, setServingSize] = useState(String(user?.servingSize ?? 1));
  const [isSaving, setIsSaving] = useState(false);

  const servingSizeValue = Math.min(3, Math.max(1, parseInt(servingSize, 10) || 1));

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter your phone number');
      return;
    }
    const phoneDigitsOnly = phone.replace(/[^\d]/g, '');
    if (phoneDigitsOnly.length !== MAX_PHONE_DIGITS) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        homeAddress: address.trim()
          ? {
              address: address.trim(),
              latitude: user?.homeAddress?.latitude ?? 43.7315,
              longitude: user?.homeAddress?.longitude ?? -79.7624,
            }
          : user?.homeAddress ?? null,
        servingSize: servingSizeValue,
      });
      alert('Your profile has been updated');
      router.back();
    } catch {
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    if (!confirm('Sign out? You will need to sign in again.')) return;
    await signOut();
    storage.syncOnboardingCookie(true);
    router.replace('/onboarding/sign-in');
  };

  const handleClearData = async () => {
    if (!confirm('Clear all data? This cannot be undone.')) return;
    await clearProfile();
    await storage.removeItem('meal-requests');
    router.back();
  };

  return (
    <AppShell>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <PageHeader title="Profile" />
        <div className="space-y-4 p-4 pb-10">
          {user?.authProvider && (
            <p className="text-sm" style={{ color: colors.mutedText }}>
              Signed in with {AUTH_PROVIDER_LABELS[user.authProvider] ?? user.authProvider}
            </p>
          )}

          <ProfileField label="Name" value={name} onChange={setName} colors={colors} />
          <ProfileField
            label="Phone"
            value={phone}
            onChange={(v) => setPhone(formatPhoneNumber(v))}
            colors={colors}
          />
          <ProfileField label="Home address" value={address} onChange={setAddress} colors={colors} />

          <div>
            <p className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
              Serving size
            </p>
            <input
              type="number"
              min={1}
              max={3}
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
              className="w-full rounded-xl border px-3 py-2.5"
              style={{ borderColor: colors.border, color: colors.text }}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
              Theme
            </p>
            <div className="flex gap-2">
              {(['light', 'dark', 'system'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setThemeMode(mode)}
                  className="flex-1 rounded-xl border py-2 text-sm font-semibold capitalize"
                  style={{
                    borderColor: themeMode === mode ? colors.accent : colors.border,
                    color: colors.text,
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-[28px] py-3.5 font-extrabold text-white disabled:opacity-50"
            style={{ backgroundColor: colors.accent }}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/requests/active"
              className="rounded-xl border py-3 text-center text-sm font-semibold"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              My Requests
            </Link>
            <Link
              href="/locations"
              className="rounded-xl border py-3 text-center text-sm font-semibold"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              Locations
            </Link>
            <Link
              href="/support"
              className="col-span-2 rounded-xl border py-3 text-center text-sm font-semibold"
              style={{ borderColor: colors.border, color: colors.text }}
            >
              Support
            </Link>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full rounded-xl border py-3 font-bold"
            style={{ borderColor: colors.border, color: colors.text }}
          >
            Sign Out
          </button>

          <button
            type="button"
            onClick={handleClearData}
            className="w-full text-center text-sm font-semibold text-red-600"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function ProfileField({
  label,
  value,
  onChange,
  colors,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold" style={{ color: colors.text }}>
        {label}
      </p>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border px-3 py-2.5 outline-none"
        style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceElevated }}
      />
    </div>
  );
}
