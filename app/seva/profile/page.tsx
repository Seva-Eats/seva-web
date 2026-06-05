'use client';

import {
  Bell,
  Car,
  HandHelping,
  MapPin,
  Phone,
  Soup,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { AuthProviderIcon } from '@/components/auth/AuthProviderIcon';
import { SevaFlowHeader } from '@/components/seva/SevaFlowHeader';
import { SignOutButton } from '@/components/ui/SignOutButton';
import { AUTH_PROVIDER_LABELS } from '@/constants/auth';
import { TypeClass } from '@/constants/typography';
import { useUser, type UserRole } from '@/context';
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

export default function VolunteerProfilePage() {
  const router = useRouter();
  const { user, updateProfile, setRole, clearProfile, signOut } = useUser();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [vehicleType, setVehicleType] = useState('Sedan');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.notificationsEnabled ?? true
  );
  const [isSaving, setIsSaving] = useState(false);

  const avatarInitial = (user?.name?.trim()?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();
  const providerLabel = user?.authProvider
    ? AUTH_PROVIDER_LABELS[user.authProvider] ?? user.authProvider
    : 'Email';

  const handleSave = async () => {
    if (!name.trim()) {
      alert('Please enter your name');
      return;
    }
    if (phone.trim()) {
      const phoneDigitsOnly = phone.replace(/[^\d]/g, '');
      if (phoneDigitsOnly.length !== MAX_PHONE_DIGITS) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim(),
        notificationsEnabled,
      });
      alert('Volunteer profile saved');
    } catch {
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleSignOut = async () => {
    if (!confirm('Sign out? You will need to sign in again.')) return;
    await signOut();
    storage.syncOnboardingCookie(true);
    router.replace('/onboarding/sign-in');
  };

  const handleClearData = async () => {
    if (!confirm('Clear all data? This cannot be undone.')) return;
    await clearProfile();
    router.replace('/onboarding');
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFF9F2] pb-10">
        <SevaFlowHeader title="Volunteer settings" backHref="/seva" />

        <div className="space-y-6 p-4">
          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Sevadar account</h2>
            <div className="rounded-2xl border border-[#E8E3DA] bg-white p-4">
              <div className="flex items-center gap-3 border-b border-[#F3F4F6] pb-4">
                <div
                  className={cn(
                    TypeClass.profileName,
                    'flex h-14 w-14 items-center justify-center rounded-full bg-[#F07B2A] text-white'
                  )}
                >
                  {avatarInitial}
                </div>
                <div>
                  <p className={cn(TypeClass.profileName, 'text-[#1A1A1A]')}>{name || 'Volunteer'}</p>
                  <p className={cn(TypeClass.profileEmail, 'text-[#6B7280]')}>
                    {user?.email ?? 'Not signed in'}
                  </p>
                  <span className="mt-1 inline-block rounded-md bg-[#FFE8D4] px-2 py-0.5">
                    <span className={cn(TypeClass.onboardBadge, 'text-[#F07B2A]')}>VOLUNTEER</span>
                  </span>
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
                    <AuthProviderIcon provider={user?.authProvider ?? 'email'} />
                  </div>
                </div>
              </div>

              <SignOutButton onClick={handleSignOut} />
            </div>
          </section>

          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Contact</h2>
            <div className="space-y-3">
              <VolunteerField label="Full name *" value={name} onChange={setName} />
              <VolunteerField
                label="Phone (for coordinator)"
                value={phone}
                onChange={(v) => setPhone(formatPhoneNumber(v))}
                placeholder="(647) 555-1234"
                icon={<Phone size={18} className="text-[#F07B2A]" />}
              />
            </div>
          </section>

          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Delivery</h2>
            <div className="space-y-3">
              <VolunteerField
                label="Vehicle type"
                value={vehicleType}
                onChange={setVehicleType}
                icon={<Car size={18} className="text-[#F07B2A]" />}
              />
              <p className={cn(TypeClass.caption, 'text-[#6B7280]')}>
                Vehicle details will sync to your sevadar profile when dispatch goes live.
              </p>
            </div>
          </section>

          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Notifications</h2>
            <button
              type="button"
              onClick={() => setNotificationsEnabled((v) => !v)}
              className="flex w-full items-center justify-between rounded-2xl border border-[#E8E3DA] bg-white px-4 py-3.5"
            >
              <span className="flex items-center gap-2">
                <Bell size={20} className="text-[#F07B2A]" />
                <span className={cn(TypeClass.body, 'font-medium text-[#1A1A1A]')}>
                  Route & pickup alerts
                </span>
              </span>
              <span
                className={cn(
                  'h-6 w-11 rounded-full transition-colors',
                  notificationsEnabled ? 'bg-[#F07B2A]' : 'bg-[#E5E7EB]'
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 block h-5 w-5 rounded-full bg-white shadow transition-transform',
                    notificationsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  )}
                />
              </span>
            </button>
          </section>

          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Your path</h2>
            <p className={cn(TypeClass.caption, 'mb-3 text-[#6B7280]')}>
              Switch if you need meals instead of volunteering tonight.
            </p>
            <div className="grid grid-cols-2 gap-3">
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
            </div>
          </section>

          <section>
            <h2 className={cn(TypeClass.profileSection, 'mb-3 text-[#1A1A1A]')}>Area</h2>
            <div className="flex items-center gap-2 rounded-2xl border border-[#E8E3DA] bg-white px-4 py-3">
              <MapPin size={20} className="text-[#F07B2A]" />
              <div>
                <p className={cn(TypeClass.body, 'font-medium text-[#1A1A1A]')}>
                  Mississauga · Brampton
                </p>
                <p className={cn(TypeClass.caption, 'text-[#6B7280]')}>
                  Service area for assigned routes
                </p>
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              TypeClass.btn,
              'w-full rounded-[28px] bg-[#F07B2A] py-4 font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)] disabled:opacity-60'
            )}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>

          <button
            type="button"
            onClick={handleClearData}
            className={cn(
              TypeClass.body,
              'flex w-full items-center justify-center gap-2 py-2 font-semibold text-[#EF4444]'
            )}
          >
            <Trash2 size={18} />
            Clear all data
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function VolunteerField({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className={cn(TypeClass.label, 'mb-1 block text-[#6B7280]')}>{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2">{icon}</span>
        )}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'type-body-md w-full rounded-xl border border-[#E8E3DA] bg-[#FDF8F3] py-3 text-[#1A1A1A] outline-none focus:border-[#F07B2A]',
            icon ? 'pl-11 pr-4' : 'px-4'
          )}
        />
      </div>
    </div>
  );
}
