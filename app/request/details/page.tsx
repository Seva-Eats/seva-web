'use client';

import { DoorOpen, MapPin, UtensilsCrossed, UserRound } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { MealIcon } from '@/components/meals/MealIcon';
import { RequestFlowHeader } from '@/components/request/RequestFlowHeader';
import { getMealById } from '@/constants/meals';
import { pickupLocations } from '@/constants/mock-data';
import { useLocation, useRequests, useUser } from '@/context';

const SERVING_SIZES = [1, 2, 3];
const DELIVERY_WINDOWS = ['12–2 PM', '2–4 PM', '6–8 PM'];
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

  const selectedMeals = useMemo(() => {
    const meals = params.get('meals');
    if (!meals) return [];
    return meals
      .split(',')
      .map((item) => {
        const [id, qty] = item.split(':');
        const meal = getMealById(id);
        return meal ? { meal, quantity: parseInt(qty, 10) } : null;
      })
      .filter(Boolean) as { meal: NonNullable<ReturnType<typeof getMealById>>; quantity: number }[];
  }, [params]);

  const selectedLocation = useMemo(() => {
    const locId = params.get('location');
    if (!locId) return null;
    return pickupLocations.find((l) => l.id === locId) ?? null;
  }, [params]);

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [servingSize, setServingSize] = useState(user?.servingSize ?? 1);
  const [thankYouNote, setThankYouNote] = useState('');
  const [deliveryPreference, setDeliveryPreference] = useState<'leave_at_door' | 'hand_to_me'>(
    'leave_at_door'
  );
  const [deliveryWindow, setDeliveryWindow] = useState(DELIVERY_WINDOWS[0]);
  const [donationAmount, setDonationAmount] = useState('5');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const deliveryAddress =
    user?.homeAddress?.address ??
    selectedLocation?.location.address ??
    userLocation?.address ??
    '123 Community Way, Brampton, ON';

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
      alert('Please enter your name.');
      return;
    }
    if (!phone.trim()) {
      alert('Please enter your phone number.');
      return;
    }
    const phoneDigitsOnly = phone.replace(/[^\d]/g, '');
    if (phoneDigitsOnly.length !== 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }
    if (activeRequest) {
      alert('You already have an active request.');
      return;
    }

    setIsSubmitting(true);
    const mealSummary = selectedMeals.map((s) => `${s.quantity}x ${s.meal.name}`).join(', ');
    const donationValue = donationAmount ? Number(donationAmount.replace(/[^0-9]/g, '')) : undefined;
    const note = thankYouNote.trim()
      ? `${thankYouNote.trim()} | Meals: ${mealSummary}`
      : `Meals: ${mealSummary}`;

    const newRequest = submitRequest({
      recipientName: name.trim(),
      recipientPhone: phone.trim(),
      deliveryAddress: { address: deliveryAddress, latitude: lat, longitude: lon },
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
      <div className="min-h-screen bg-[#FFF9F2] pb-28">
        <RequestFlowHeader
          title="Delivery Details"
          backHref={
            params.get('location')
              ? `/request/new?location=${params.get('location')}`
              : '/request/location'
          }
        />

        <div className="space-y-5 px-4 pt-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((step) => (
              <span
                key={step}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  step === 1
                    ? 'bg-[#F07B2A] text-white'
                    : 'border border-[#E5E7EB] bg-white text-[#1A1A1A]'
                }`}
              >
                {step}
              </span>
            ))}
          </div>

          {selectedMeals.length > 0 && (
            <section>
              <p className="mb-2 text-base font-bold text-[#1A1A1A]">Your Order</p>
              <div className="space-y-2">
                {selectedMeals.map(({ meal, quantity }) => (
                  <div key={meal.id} className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ backgroundColor: meal.backgroundColor }}
                    >
                      <MealIcon icon={meal.icon} color={meal.iconColor} size={20} />
                    </div>
                    <span className="flex-1 text-sm font-semibold text-[#1A1A1A]">{meal.name}</span>
                    <span className="text-sm font-bold text-[#F07B2A]">x{quantity}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <label className="mb-1.5 block text-base font-bold text-[#1A1A1A]">Your Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#F07B2A]"
            />
          </section>

          <section>
            <label className="mb-1.5 block text-base font-bold text-[#1A1A1A]">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder="(XXX) XXX-XXXX"
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-4 py-3 text-[#1A1A1A] outline-none focus:border-[#F07B2A]"
            />
            <p className="mt-1 text-xs text-[#6B7280]">
              So the driver can contact if there are any issues
            </p>
          </section>

          <section>
            <p className="mb-2 text-base font-bold text-[#1A1A1A]">Delivery location</p>
            <div className="flex gap-3 rounded-xl border border-[#E8E3DA] bg-[#FDF8F3] p-4">
              <MapPin size={22} className="shrink-0 text-[#F07B2A]" />
              <div>
                <p className="font-bold text-[#1A1A1A]">
                  {selectedLocation?.name ?? 'Brampton Distribution Hub'}
                </p>
                <p className="text-sm text-[#6B7280]">{deliveryAddress}</p>
                <p className="mt-0.5 text-sm font-semibold text-[#F07B2A]">
                  {selectedLocation?.nextPickupWindow ?? 'Friday, 6:00 PM'}
                </p>
              </div>
            </div>
            <p className="mt-1 text-xs text-[#6B7280]">
              Meals are prepared at this hub for partner drop-offs.
            </p>
          </section>

          <section>
            <p className="text-base font-bold text-[#1A1A1A]">Serving Size</p>
            <p className="mb-2 text-xs text-[#6B7280]">How many servings should we prepare?</p>
            <div className="flex gap-3">
              {SERVING_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setServingSize(size)}
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${
                    servingSize === size
                      ? 'bg-[#F07B2A] text-white'
                      : 'border border-[#E8E3DA] bg-white text-[#1A1A1A]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-base font-bold text-[#1A1A1A]">Delivery window</p>
            <div className="grid grid-cols-3 gap-2">
              {DELIVERY_WINDOWS.map((window) => (
                <button
                  key={window}
                  type="button"
                  onClick={() => setDeliveryWindow(window)}
                  className={`rounded-xl py-2.5 text-xs font-bold ${
                    deliveryWindow === window
                      ? 'bg-[#F07B2A] text-white'
                      : 'border border-[#E8E3DA] bg-white text-[#1A1A1A]'
                  }`}
                >
                  {window}
                </button>
              ))}
            </div>
          </section>

          <section>
            <p className="mb-2 text-base font-bold text-[#1A1A1A]">Delivery preference</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryPreference('leave_at_door')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
                  deliveryPreference === 'leave_at_door'
                    ? 'bg-[#F07B2A] text-white'
                    : 'border border-[#E8E3DA] bg-white text-[#1A1A1A]'
                }`}
              >
                <DoorOpen size={18} />
                Leave at door
              </button>
              <button
                type="button"
                onClick={() => setDeliveryPreference('hand_to_me')}
                className={`flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold ${
                  deliveryPreference === 'hand_to_me'
                    ? 'bg-[#F07B2A] text-white'
                    : 'border border-[#E8E3DA] bg-white text-[#1A1A1A]'
                }`}
              >
                <UserRound size={18} />
                Hand to me
              </button>
            </div>
            <p className="mt-2 text-xs text-[#6B7280]">
              We can&apos;t promise restaurant-heat, but every meal is made with love.
            </p>
          </section>

          <section>
            <p className="text-base font-bold text-[#1A1A1A]">
              Give a message to your driver <span aria-hidden>❤️</span>
            </p>
            <p className="mb-2 text-xs text-[#6B7280]">Optional message that stays private</p>
            <textarea
              value={thankYouNote}
              onChange={(e) => setThankYouNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
              placeholder="Write a short thank-you"
              rows={4}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#F07B2A]"
            />
            <div className="mt-1 flex justify-between text-xs text-[#6B7280]">
              <span>Be respectful. Notes are visible to drivers.</span>
              <span>
                {thankYouNote.length}/{MAX_NOTE_LENGTH}
              </span>
            </div>
          </section>

          <section>
            <p className="text-base font-bold text-[#1A1A1A]">Donate (optional)</p>
            <p className="mb-2 text-xs text-[#6B7280]">
              Help support packaging and delivery costs
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]">$</span>
              <input
                value={donationAmount}
                onChange={(e) =>
                  setDonationAmount(e.target.value.replace(/[^0-9]/g, '').slice(0, 3))
                }
                className="w-full rounded-xl border border-[#E8E3DA] bg-white py-3 pl-8 pr-4 text-[#1A1A1A] outline-none focus:border-[#F07B2A]"
              />
            </div>
          </section>
        </div>

        <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 px-4 pb-8 pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-[28px] bg-[#F07B2A] py-4 text-base font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)] disabled:opacity-60 active:scale-[0.99]"
          >
            <UtensilsCrossed size={20} />
            {isSubmitting ? 'Submitting...' : 'Request Drop-off'}
          </button>
        </div>
      </div>
    </AppShell>
  );
}

export default function RequestDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#FFF9F2]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F07B2A] border-t-transparent" />
        </div>
      }
    >
      <DetailsContent />
    </Suspense>
  );
}
