'use client';

import { motion } from 'framer-motion';
import { MapPin, Store, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import { pickupLocations, type PickupLocation } from '@/constants/mock-data';
import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

function LocationCard({
  location,
  onPress,
  index,
}: {
  location: PickupLocation;
  onPress: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring' }}
      onClick={onPress}
      className="flex w-full items-start gap-4 rounded-2xl border border-[#E8E3DA] bg-white p-4 text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)] active:scale-[0.99]"
    >
      <MapPin size={28} className="shrink-0 text-[#F07B2A]" fill="#F07B2A" strokeWidth={1} />
      <div className="min-w-0 flex-1">
        <p className={cn(TypeClass.bodyMd, 'font-semibold text-[#1A1A1A]')}>{location.name}</p>
        <p className={cn(TypeClass.bodySm, 'text-[#6B7280]')}>{location.address}</p>
        <p className={cn(TypeClass.bodySm, 'mt-0.5 font-semibold text-[#F07B2A]')}>{location.distance} away</p>
        <p className={cn(TypeClass.caption, 'text-[#6B7280]')}>Next delivery: {location.nextPickupWindow}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className={cn(TypeClass.captionXs, 'text-[#6B7280]')}>
            Meals available today: {location.boxesAvailable}
          </span>
          <span className={cn(TypeClass.micro, 'rounded-md bg-[#ECFDF5] px-2 py-0.5 uppercase tracking-wide text-[#059669]')}>
            Available
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function RequestLocationPage() {
  const router = useRouter();

  const handleSelect = (location: PickupLocation) => {
    router.push(`/request/new?location=${location.id}`);
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FDF8F3]">
        <header className="flex items-center justify-between border-b border-[#E8E3DA] px-4 py-4">
          <div className="w-10" />
          <div className="text-center">
            <h1 className={cn(TypeClass.screenTitle, 'text-[#1A1A1A]')}>Choose Pickup Hub</h1>
            <p className={cn(TypeClass.screenSubtitle, 'mt-0.5 text-[#6B7280]')}>
              Select a nearby gurdwara hub
            </p>
          </div>
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E3DA]"
            aria-label="Profile"
          >
            <User size={20} className="text-[#1A1A1A]" />
          </Link>
        </header>

        <div className="p-4">
          <div className="mb-5 flex gap-3 rounded-2xl bg-[#FFF2E6] p-4">
            <Store size={24} className="shrink-0 text-[#F07B2A]" />
            <div>
              <p className={cn(TypeClass.label, 'text-[#C2410C]')}>Pick up at a Seva hub</p>
              <p className={cn(TypeClass.bodySm, 'mt-0.5 text-[#EA580C]')}>
                Choose the hub with the best delivery window before selecting meals
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {pickupLocations.map((loc, index) => (
              <LocationCard
                key={loc.id}
                location={loc}
                onPress={() => handleSelect(loc)}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
