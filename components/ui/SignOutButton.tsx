'use client';

import { LogOut } from 'lucide-react';

import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

type SignOutButtonProps = {
  onClick: () => void;
  className?: string;
};

export function SignOutButton({ onClick, className }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'btn-plain mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] py-3 text-[#DC2626] transition-colors',
        'hover:border-[#FCA5A5] hover:bg-[#FEE2E2] active:scale-[0.99]',
        TypeClass.authBtn,
        'font-extrabold tracking-[0.01em]',
        className
      )}
    >
      <LogOut size={18} strokeWidth={2.25} />
      Sign Out
    </button>
  );
}
