'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, MapPin, Store, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { pickupLocations, type PickupLocation } from '@/constants/mock-data';
import { useThemeColors } from '@/hooks/use-theme-colors';

function LocationCard({
  location,
  selected,
  onPress,
  index,
  colors,
}: {
  location: PickupLocation;
  selected: boolean;
  onPress: () => void;
  index: number;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring' }}
      onClick={onPress}
      className="relative flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left active:scale-[0.99]"
      style={{
        backgroundColor: selected
          ? colors.isDark
            ? 'rgba(249, 115, 22, 0.15)'
            : '#FFFBEB'
          : colors.surfaceElevated,
        borderColor: selected ? colors.accent : colors.border,
        boxShadow: colors.isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
        style={{
          backgroundColor: selected ? colors.accent : colors.isDark ? 'rgba(249,115,22,0.2)' : '#FFF7ED',
        }}
      >
        <MapPin size={28} color={selected ? '#FFF8F0' : colors.accent} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold" style={{ color: colors.text }}>
          {location.name}
        </p>
        <p className="text-[13px]" style={{ color: colors.mutedText }}>
          {location.address}
        </p>
        <p className="text-xs font-semibold" style={{ color: colors.accent }}>
          {location.distance} away
        </p>
        <p className="text-[11px]" style={{ color: colors.mutedText }}>
          Next delivery: {location.nextPickupWindow}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[11px]" style={{ color: colors.mutedText }}>
            Meals available today: {location.boxesAvailable}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: colors.isDark ? 'rgba(34, 197, 94, 0.2)' : '#ECFDF5',
              color: colors.isDark ? '#34D399' : '#059669',
            }}
          >
            Available
          </span>
        </div>
      </div>

      {selected && (
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: colors.accent }}
        >
          <Check size={16} color="#FFF8F0" />
        </span>
      )}
    </motion.button>
  );
}

export default function RequestLocationPage() {
  const router = useRouter();
  const colors = useThemeColors();
  const [selected, setSelected] = useState<PickupLocation | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    router.push(`/request/new?location=${selected.id}`);
  };

  return (
    <AppShell>
      <div className="relative min-h-screen pb-28" style={{ backgroundColor: colors.background }}>
        <header
          className="flex items-center justify-between border-b px-4 py-4"
          style={{ borderColor: colors.border }}
        >
          <div className="w-10" />
          <div className="text-center">
            <h1 className="text-[17px] font-semibold" style={{ color: colors.text }}>
              Choose Pickup Hub
            </h1>
            <p className="mt-0.5 text-xs" style={{ color: colors.mutedText }}>
              Select a nearby gurdwara hub
            </p>
          </div>
          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center"
            aria-label="Profile"
          >
            <User size={24} color={colors.text} />
          </Link>
        </header>

        <div className="p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6 flex gap-4 rounded-2xl p-4"
            style={{
              backgroundColor: colors.isDark ? 'rgba(249, 115, 22, 0.15)' : '#FFF7ED',
            }}
          >
            <Store size={24} color={colors.accent} />
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: colors.isDark ? colors.accent : '#92400E' }}
              >
                Pick up at a Seva hub
              </p>
              <p
                className="text-[13px] leading-[18px]"
                style={{ color: colors.isDark ? colors.mutedText : '#B45309' }}
              >
                Choose the hub with the best delivery window before selecting meals
              </p>
            </div>
          </motion.div>

          <div className="flex flex-col gap-4">
            {pickupLocations.map((loc, index) => (
              <LocationCard
                key={loc.id}
                location={loc}
                selected={selected?.id === loc.id}
                onPress={() => setSelected(loc)}
                index={index}
                colors={colors}
              />
            ))}
          </div>
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t px-4 py-4 pb-8"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                boxShadow: colors.isDark ? 'none' : '0 -4px 16px rgba(0,0,0,0.08)',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <MapPin size={16} color="#FFF8F0" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: colors.text }}>
                      {selected.name}
                    </p>
                    <p className="text-xs" style={{ color: colors.mutedText }}>
                      Pickup hub selected
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleContinue}
                  className="flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold text-[#FFF8F0] active:scale-[0.99]"
                  style={{ backgroundColor: colors.accent }}
                >
                  Continue
                  <ArrowRight size={20} color="#FFF8F0" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
