'use client';

import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

type PageLoaderProps = {
  message?: string;
  className?: string;
  fullScreen?: boolean;
};

export function PageLoader({
  message = 'Loading...',
  className,
  fullScreen = true,
}: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-[#FFF9F2] px-6',
        fullScreen ? 'min-h-screen' : 'py-12',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_8px_24px_rgba(240,123,42,0.12)]">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-[#FFE8D4] border-t-[#F07B2A]" />
      </div>
      <p className={cn(TypeClass.body, 'mt-4 font-semibold text-[#1A1A1A]')}>{message}</p>
      <p className={cn(TypeClass.caption, 'mt-1 text-[#9CA3AF]')}>Seva Eats</p>
    </div>
  );
}
