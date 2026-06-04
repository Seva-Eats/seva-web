'use client';

import {
  ClipboardList,
  Crosshair,
  HandHelping,
  History,
  LogOut,
  Mail,
  Map,
  MapPin,
  HelpCircle,
  Soup,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { AUTH_PROVIDER_LABELS } from '@/constants/auth';
import { TypeClass } from '@/constants/typography';
import { useLocation, useUser, type UserRole } from '@/context';
import { cn } from '@/lib/cn';
import { getHomePathForRole } from '@/lib/navigation/role-paths';
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
  const { user, updateProfile, setRole, clearProfile, signOut } = useUser();
  const { userLocation, refreshLocation } = useLocation();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.homeAddress?.address ?? '');
  const [servingSize, setServingSize] = useState(String(user?.servingSize ?? 1));
  const [showMap, setShowMap] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.role === 'dasher') {
      router.replace('/seva/profile');
    }
  }, [user?.role, router]);

  const handleRoleChange = async (role: UserRole) => {
    if (role === user?.role) return;
    const message =
      role === 'recipient'
        ? 'Switch to recipient? You will request meals instead of delivering.'
        : 'Switch to volunteer? You will see delivery routes instead of meal requests.';
    if (!confirm(message)) return;
    await setRole(role);
    router.replace(getHomePathForRole(role));
  };

  const servingSizeValue = Math.min(3, Math.max(1, parseInt(servingSize, 10) || 1));
  const avatarInitial = (user?.name?.trim()?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();
  const providerLabel = user?.authProvider
    ? AUTH_PROVIDER_LABELS[user.authProvider] ?? user.authProvider
    : 'Email';

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
              latitude: user?.homeAddress?.latitude ?? userLocation?.latitude ?? 43.7315,
              longitude: user?.homeAddress?.longitude ?? userLocation?.longitude ?? -79.7624,
            }
          : user?.homeAddress ?? null,
        servingSize: servingSizeValue,
      });
      alert('Your profile has been updated');
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
    router.replace('/onboarding');
  };

  const handleQuickAddLocation = async () => {
    await refreshLocation();
    if (userLocation?.address) {
      setAddress(userLocation.address);
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFF9F2] pb-10">
        <PageHeader title="Profile" backHref="/request/location" />

        <div className="space-y-6 p-4">
          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Account</h2>
            <div className="rounded-2xl border border-[#E8E3DA] bg-white p-4">
              <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                <div className={cn(TypeClass.profileName, 'flex h-14 w-14 items-center justify-center rounded-full bg-[#F07B2A] text-white')}>
                  {avatarInitial}
                </div>
                <div>
                  <p className={cn(TypeClass.profileName, 'text-[#1A1A1A]')}>{name || 'Guest'}</p>
                  <p className={cn(TypeClass.profileEmail, 'text-[#6B7280]')}>
                    {user?.email ?? 'Not signed in'}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] p-3">
                  <p className={cn(TypeClass.metaLabel, 'text-[#9CA3AF]')}>Status</p>
                  <p className={cn(TypeClass.metaValue, 'mt-0.5 text-[#1A1A1A]')}>
                    {user?.isAuthenticated ? 'Signed in' : 'Guest'}
                  </p>
                </div>
                <div className="rounded-xl border border-[#F3F4F6] bg-[#FAFAFA] p-3">
                  <p className={cn(TypeClass.metaLabel, 'text-[#9CA3AF]')}>Provider</p>
                  <div className="mt-0.5 flex items-center justify-between">
                    <p className={cn(TypeClass.metaValue, 'text-[#1A1A1A]')}>{providerLabel}</p>
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F07B2A]">
                      <Mail size={14} color="#fff" />
                    </span>
                  </div>
                </div>
              </div>

              <p className={cn(TypeClass.caption, 'mt-3 text-[#6B7280]')}>
                Signed in through onboarding. Sign out to switch accounts.
              </p>

              <button
                type="button"
                onClick={handleSignOut}
                className={cn(TypeClass.body, 'mt-3 flex w-full items-center justify-center gap-2 py-2 font-semibold text-[#EF4444]')}
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </section>

          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Personal Information</h2>
            <div className="space-y-3">
              <ProfileField label="Full Name *" value={name} onChange={setName} />
              <ProfileField
                label="Phone Number *"
                value={phone}
                onChange={(v) => setPhone(formatPhoneNumber(v))}
                placeholder="(647) 555-1234"
              />
              <div>
                <ProfileField label="Serving Size" value={servingSize} onChange={setServingSize} />
                <p className={cn(TypeClass.caption, 'mt-1 text-[#6B7280]')}>Number of people (1-3)</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Your path</h2>
            <p className={cn(TypeClass.caption, 'mb-3 text-[#6B7280]')}>
              Switch if you want to volunteer instead of requesting meals.
            </p>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('recipient')}
                className={cn(
                  'flex flex-col items-center rounded-2xl border px-3 py-4',
                  user?.role === 'recipient'
                    ? 'border-[#F07B2A] bg-[#FFF7ED]'
                    : 'border-[#E8E3DA] bg-white'
                )}
              >
                <Soup size={22} className="text-[#F07B2A]" />
                <span className={cn(TypeClass.label, 'mt-2 text-[#1A1A1A]')}>Recipient</span>
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('dasher')}
                className={cn(
                  'flex flex-col items-center rounded-2xl border px-3 py-4',
                  user?.role === 'dasher'
                    ? 'border-[#F07B2A] bg-[#FFF7ED]'
                    : 'border-[#E8E3DA] bg-white'
                )}
              >
                <HandHelping size={22} className="text-[#F07B2A]" />
                <span className={cn(TypeClass.label, 'mt-2 text-[#1A1A1A]')}>Volunteer</span>
              </button>
            </div>
          </section>

          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Quick actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/requests/active"
                className="flex flex-col items-center rounded-2xl border border-[#E8E3DA] bg-white px-4 py-5 active:scale-[0.99]"
              >
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4EC]">
                  <ClipboardList size={24} className="text-[#F07B2A]" />
                </span>
                <span className={cn(TypeClass.body, 'text-center font-semibold text-[#1A1A1A]')}>
                  Active requests
                </span>
              </Link>
              <Link
                href="/requests/history"
                className="flex flex-col items-center rounded-2xl border border-[#E8E3DA] bg-white px-4 py-5 active:scale-[0.99]"
              >
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4EC]">
                  <History size={24} className="text-[#F07B2A]" />
                </span>
                <span className={cn(TypeClass.body, 'text-center font-semibold text-[#1A1A1A]')}>
                  Request history
                </span>
              </Link>
              <Link
                href="/locations"
                className="flex flex-col items-center rounded-2xl border border-[#E8E3DA] bg-white px-4 py-5 active:scale-[0.99]"
              >
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4EC]">
                  <MapPin size={24} className="text-[#F07B2A]" />
                </span>
                <span className={cn(TypeClass.body, 'text-center font-semibold text-[#1A1A1A]')}>
                  Nearby locations
                </span>
              </Link>
              <Link
                href="/support"
                className="flex flex-col items-center rounded-2xl border border-[#E8E3DA] bg-white px-4 py-5 active:scale-[0.99]"
              >
                <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF4EC]">
                  <HelpCircle size={24} className="text-[#F07B2A]" />
                </span>
                <span className={cn(TypeClass.body, 'text-center font-semibold text-[#1A1A1A]')}>
                  Help & support
                </span>
              </Link>
            </div>
          </section>

          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Home Address</h2>
            <div className="relative mb-2">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F07B2A]" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter a shelter or partner address"
                className={cn('type-body-md w-full rounded-xl border border-[#E8E3DA] bg-white py-3 pl-11 pr-4 text-[#1A1A1A] outline-none focus:border-[#F07B2A]')}
              />
            </div>

            <button
              type="button"
              onClick={handleQuickAddLocation}
              className={cn(TypeClass.label, 'mb-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[#F07B2A] py-2.5 text-[#F07B2A] active:scale-[0.99]')}
            >
              <Crosshair size={18} />
              Quick add current location
            </button>

            <button
              type="button"
              onClick={() => setShowMap((v) => !v)}
              className={cn(TypeClass.label, 'mb-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#E8E3DA] bg-white py-2.5 text-[#1A1A1A]')}
            >
              <Map size={18} className="text-[#F07B2A]" />
              {showMap ? 'Hide map' : 'Show map'}
            </button>

            {showMap && (
              <>
                <div className="h-44 overflow-hidden rounded-2xl border border-[#E8E3DA] bg-gradient-to-br from-[#D1FAE5] via-[#F3F4F6] to-[#DBEAFE]">
                  <div className="flex h-full items-center justify-center">
                    <MapPin size={40} className="text-[#F07B2A]" fill="#F07B2A" strokeWidth={1} />
                  </div>
                </div>
                <p className={cn(TypeClass.caption, 'mt-2 text-center text-[#6B7280]')}>
                  Tap the map or drag the pin to set your address location.
                </p>
              </>
            )}
          </section>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(TypeClass.btn, 'w-full rounded-[28px] bg-[#F07B2A] py-4 font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)] disabled:opacity-60')}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            type="button"
            onClick={handleClearData}
            className={cn(TypeClass.body, 'flex w-full items-center justify-center gap-2 py-2 font-semibold text-[#EF4444]')}
          >
            <Trash2 size={18} />
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={cn(TypeClass.label, 'mb-1 block text-[#6B7280]')}>{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn('type-body-md w-full rounded-xl border border-[#E8E3DA] bg-[#FDF8F3] px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#F07B2A]')}
      />
    </div>
  );
}
