'use client';

import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

type SevaFlowHeaderProps = {
  title: string;
  subtitle?: string;
  backHref?: string;
};

export function SevaFlowHeader({ title, subtitle, backHref = '/seva' }: SevaFlowHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }
    router.replace(backHref);
  };

  return (
    <header className="border-b border-[#E8E3DA] bg-[#FFF9F2] px-4 py-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center text-[#1A1A1A]"
          aria-label="Go back"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </button>
        <div className="flex-1 px-2 text-center">
          <h1 className={cn(TypeClass.screenTitle, 'text-[#1A1A1A]')}>{title}</h1>
          {subtitle && (
            <p className={cn(TypeClass.screenSubtitle, 'mt-0.5 text-[#6B7280]')}>{subtitle}</p>
          )}
        </div>
        <Link
          href="/seva/profile"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8E3DA] text-[#1A1A1A]"
          aria-label="Volunteer settings"
        >
          <User size={20} strokeWidth={2} />
        </Link>
      </div>
    </header>
  );
}
