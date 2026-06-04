'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { RequestNav } from '@/components/RequestNav';
import { getMealById } from '@/constants/meals';
import { pickupLocations } from '@/constants/mock-data';
import { useLocation, useRequests, useUser } from '@/context';
import { useThemeColors } from '@/hooks/use-theme-colors';

const SERVING_SIZES = [1, 2, 3];
const DELIVERY_WINDOWS = ['12-2 PM', '2-4 PM', '6-8 PM'];
const MAX_NOTE_LENGTH = 200;

const formatPhoneNumber = (value: string): string => {
  const digitsOnly = value.replace(/[^\d]/g, '').slice(0, 10);
  if (digitsOnly.length === 0) return '';
  if (digitsOnly.length <= 3) return `(${digitsOnly}`;
  if (digitsOnly.length <= 6) return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
  return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
};

function DetailsContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { userLocation } = useLocation();
  const { user } = useUser();
  const { submitRequest, activeRequest } = useRequests();
  const colors = useThemeColors();

  const selectedMeals = useMemo(() => {
    const meals = params.get('meals');
    if (!meals) return [];
    return meals.split(',').map((item) => {
      const [id, qty] = item.split(':');
      const meal = getMealById(id);
      return meal ? { meal, quantity: parseInt(qty, 10) } : null;
    }).filter(Boolean) as { meal: NonNullable<ReturnType<typeof getMealById>>; quantity: number }[];
  }, [params]);

  const selectedLocation = useMemo(() => {
    const locId = params.get('location');
    if (!locId) return null;
    return pickupLocations.find((l) => l.id === locId) ?? null;
  }, [params]);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(
    user?.homeAddress?.address ?? selectedLocation?.location.address ?? ''
  );
  const [servingSize, setServingSize] = useState(user?.servingSize ?? 2);
  const [thankYouNote, setThankYouNote] = useState('');
  const [deliveryPreference, setDeliveryPreference] = useState<'leave_at_door' | 'hand_to_me'>('leave_at_door');
  const [deliveryWindow, setDeliveryWindow] = useState(DELIVERY_WINDOWS[0]);
  const [donationAmount, setDonationAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const lat =
    user?.homeAddress?.latitude ??
    selectedLocation?.location.latitude ??
    userLocation?.latitude ??
    43.7315;
  const lon =
    user?.homeAddress?.longitude ??
    selectedLocation?.location.longitude ??
    userLocation?.longitude ??
    -79.7624;

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Name Required: Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      alert('Phone Required: Please enter your phone number.');
      return;
    }
    const phoneDigitsOnly = phone.replace(/[^\d]/g, '');
    if (phoneDigitsOnly.length !== 10) {
      alert('Invalid Phone: Please enter a valid 10-digit phone number.');
      return;
    }
    if (!address.trim()) {
      alert('Address Required: Please enter your delivery address.');
      return;
    }
    if (activeRequest) {
      alert('You already have an active request.');
      return;
    }

    setIsSubmitting(true);
    const mealSummary = selectedMeals.map((s) => `${s.quantity}x ${s.meal.name}`).join(', ');
    const donationValue = donationAmount ? Number(donationAmount) : undefined;
    const note = thankYouNote.trim()
      ? `${thankYouNote.trim()} | Meals: ${mealSummary} | Delivery: ${deliveryPreference === 'leave_at_door' ? 'Leave at door' : 'Hand to me'} | Window: ${deliveryWindow}`
      : `Meals: ${mealSummary} | Delivery: ${deliveryPreference === 'leave_at_door' ? 'Leave at door' : 'Hand to me'} | Window: ${deliveryWindow}`;

    const newRequest = submitRequest({
      recipientName: name.trim(),
      recipientPhone: phone.trim(),
      deliveryAddress: { address: address.trim(), latitude: lat, longitude: lon },
      servingSize,
      dietaryRestrictions: user?.dietaryRestrictions ?? [],
      driverNote: note,
      selectedMeals: selectedMeals.map((item) => ({
        id: item.meal.id,
        name: item.meal.name,
        quantity: item.quantity,
      })),
      deliveryPreference,
      deliveryWindow,
      donationAmount: donationValue,
      pickupLocationId: selectedLocation?.id,
      pickupLocationName: selectedLocation?.name,
      pickupLocation: selectedLocation?.location,
    });

    router.push(`/request/${newRequest.id}`);
  };

  return (
    <AppShell>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <RequestNav />
        <div className="px-4 pb-8 pt-4">
          <h1 className="text-2xl font-extrabold" style={{ color: colors.text }}>
            Delivery details
          </h1>

          <div className="mt-4 space-y-3">
            <Field label="Name" value={name} onChange={setName} colors={colors} />
            <Field
              label="Phone"
              value={phone}
              onChange={(v) => setPhone(formatPhoneNumber(v))}
              colors={colors}
            />
            <Field label="Delivery address" value={address} onChange={setAddress} colors={colors} />
            {userLocation && (
              <button
                type="button"
                className="rounded-xl border px-3 py-2 text-sm font-semibold"
                style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceElevated }}
                onClick={() => setAddress(userLocation.address)}
              >
                Use my current location
              </button>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                Serving size
              </p>
              <div className="flex gap-2">
                {SERVING_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setServingSize(size)}
                    className="flex-1 rounded-xl border py-2 font-bold"
                    style={{
                      borderColor: servingSize === size ? colors.accent : colors.border,
                      backgroundColor: servingSize === size ? `${colors.accent}22` : 'transparent',
                      color: colors.text,
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                Delivery window
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DELIVERY_WINDOWS.map((window) => (
                  <button
                    key={window}
                    type="button"
                    onClick={() => setDeliveryWindow(window)}
                    className="rounded-xl border py-2 text-xs font-bold"
                    style={{
                      borderColor: deliveryWindow === window ? colors.accent : colors.border,
                      backgroundColor: deliveryWindow === window ? `${colors.accent}22` : 'transparent',
                      color: colors.text,
                    }}
                  >
                    {window}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                Delivery preference
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryPreference('leave_at_door')}
                  className="rounded-xl border py-2 text-sm font-bold"
                  style={{
                    borderColor: deliveryPreference === 'leave_at_door' ? colors.accent : colors.border,
                    backgroundColor: deliveryPreference === 'leave_at_door' ? `${colors.accent}22` : 'transparent',
                    color: colors.text,
                  }}
                >
                  Leave at door
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryPreference('hand_to_me')}
                  className="rounded-xl border py-2 text-sm font-bold"
                  style={{
                    borderColor: deliveryPreference === 'hand_to_me' ? colors.accent : colors.border,
                    backgroundColor: deliveryPreference === 'hand_to_me' ? `${colors.accent}22` : 'transparent',
                    color: colors.text,
                  }}
                >
                  Hand to me
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                Driver note (optional)
              </p>
              <textarea
                value={thankYouNote}
                onChange={(e) => setThankYouNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
                rows={3}
                className="w-full rounded-xl border px-3 py-2 text-sm outline-none"
                style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceElevated }}
              />
              <p className="text-xs" style={{ color: colors.mutedText }}>
                {thankYouNote.length}/{MAX_NOTE_LENGTH}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold" style={{ color: colors.text }}>
                Donation (optional)
              </p>
              <input
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))}
                placeholder="5"
                inputMode="numeric"
                className="w-full rounded-xl border px-3 py-2.5 outline-none"
                style={{ borderColor: colors.border, color: colors.text, backgroundColor: colors.surfaceElevated }}
              />
              <p className="text-xs" style={{ color: colors.mutedText }}>
                100% optional. Never required.
              </p>
            </div>

            {selectedMeals.length > 0 && (
              <div className="rounded-xl border p-3" style={{ borderColor: colors.border }}>
                <p className="text-sm font-semibold" style={{ color: colors.text }}>
                  Selected meals
                </p>
                {selectedMeals.map((s) => (
                  <p key={s.meal.id} className="text-sm" style={{ color: colors.mutedText }}>
                    {s.quantity}x {s.meal.name}
                  </p>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-[28px] py-3.5 text-base font-extrabold text-white disabled:opacity-50"
            style={{ backgroundColor: colors.accent }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Field({
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

export default function RequestDetailsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF8F0]" />}>
      <DetailsContent />
    </Suspense>
  );
}
