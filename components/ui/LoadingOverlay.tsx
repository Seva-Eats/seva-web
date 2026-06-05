'use client';

import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

export function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/25 px-6 backdrop-blur-[2px]">
      <div className="w-full max-w-[300px] rounded-2xl border border-[#E8E3DA] bg-white px-6 py-7 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF7ED]">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-[#FFE8D4] border-t-[#F07B2A]" />
        </div>
        <p className={cn(TypeClass.body, 'mt-4 text-center font-semibold text-[#1A1A1A]')}>
          {message}
        </p>
      </div>
    </div>
  );
}
