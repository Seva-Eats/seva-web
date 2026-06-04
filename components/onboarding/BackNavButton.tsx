'use client';

import { ChevronLeft } from 'lucide-react';

export default function BackNavButton({ onPress }: { onPress: () => void }) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E9DED3] bg-[#FFF9F4] text-[#2A2A2A] active:scale-[0.97]"
      aria-label="Go back"
    >
      <ChevronLeft size={18} strokeWidth={2.5} />
    </button>
  );
}
