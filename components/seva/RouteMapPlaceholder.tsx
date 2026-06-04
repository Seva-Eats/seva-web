'use client';

import { MapPin, Navigation } from 'lucide-react';

import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

type RouteMapPlaceholderProps = {
  label: string;
  address: string;
  highlight?: 'pickup' | 'dropoff';
};

export function RouteMapPlaceholder({ label, address, highlight = 'dropoff' }: RouteMapPlaceholderProps) {
  const accent = highlight === 'pickup' ? '#059669' : '#F07B2A';

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-[#E8E3DA] bg-[#F3F4F6]"
      style={{ minHeight: 200 }}
    >
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 320 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M40 160 Q120 80 200 100 T280 40"
          fill="none"
          stroke={accent}
          strokeWidth="4"
          strokeDasharray="8 6"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute left-8 top-[58%] flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md">
        <MapPin size={18} className="text-[#059669]" />
      </div>
      <div
        className="absolute right-10 top-8 flex h-10 w-10 items-center justify-center rounded-full shadow-md"
        style={{ backgroundColor: accent }}
      >
        <Navigation size={20} className="text-white" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-transparent px-4 pb-4 pt-10">
        <p className={cn(TypeClass.label, 'text-[#6B7280]')}>{label}</p>
        <p className={cn(TypeClass.bodySm, 'mt-0.5 font-semibold text-[#1A1A1A]')}>{address}</p>
      </div>
    </div>
  );
}
