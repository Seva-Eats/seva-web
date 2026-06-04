'use client';

import { ONBOARDING_COLORS } from '@/constants/onboarding';

export default function ProgressDots({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-2 rounded-full transition-all"
          style={{
            width: i === current ? 24 : 8,
            backgroundColor:
              i === current ? ONBOARDING_COLORS.accent : 'rgba(240, 123, 42, 0.25)',
          }}
        />
      ))}
    </div>
  );
}
