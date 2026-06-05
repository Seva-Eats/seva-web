'use client';

import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { TypeClass } from '@/constants/typography';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/cn';

type RequestFlowHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
  closeHref?: string;
  useCloseIcon?: boolean;
};

export function RequestFlowHeader({
  title,
  subtitle,
  backHref = '/request/location',
  closeHref,
  useCloseIcon = false,
}: RequestFlowHeaderProps) {
  const router = useRouter();
  const colors = useThemeColors();

  const handleBack = () => {
    if (closeHref) {
      router.push(closeHref);
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(backHref);
  };

  return (
    <header
      className="border-b px-4 py-4"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F07B2A]/35 focus-visible:ring-offset-1',
            useCloseIcon
              ? 'hover:border-[#F6C48B] hover:bg-[#FFF1E3] active:bg-[#FDE7CF]'
              : 'hover:bg-[#F7F3EE] active:bg-[#EFE8DE]'
          )}
          aria-label="Go back"
          style={{ color: colors.text }}
        >
          {useCloseIcon ? (
            <span className="text-2xl font-light leading-none">&times;</span>
          ) : (
            <ArrowLeft size={24} strokeWidth={2} />
          )}
        </button>
        <div className="flex-1 px-2 text-center">
          <h1 className={cn(TypeClass.screenTitle)} style={{ color: colors.text }}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn(TypeClass.screenSubtitle, 'mt-0.5')} style={{ color: colors.mutedText }}>
              {subtitle}
            </p>
          )}
        </div>
        <Link
          href="/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full border"
          style={{ borderColor: colors.border, color: colors.text }}
          aria-label="Profile"
        >
          <User size={20} strokeWidth={2} />
        </Link>
      </div>
    </header>
  );
}
