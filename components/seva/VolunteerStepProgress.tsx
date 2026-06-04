'use client';

import { Check } from 'lucide-react';

import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

type VolunteerStepProgressProps = {
  steps: string[];
  currentIndex: number;
  title?: string;
};

export function VolunteerStepProgress({ steps, currentIndex, title = 'Your progress' }: VolunteerStepProgressProps) {
  return (
    <div className="rounded-2xl border border-[#E8E3DA] bg-white p-4">
      <p className={cn(TypeClass.progressTitle, 'mb-4 text-[#1A1A1A]')}>{title}</p>
      <ol className="space-y-3">
        {steps.map((label, index) => {
          const complete = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                  complete && 'bg-[#D1FAE5] text-[#059669]',
                  active && 'bg-[#FFE8D4] text-[#F07B2A]',
                  !complete && !active && 'bg-[#F3F4F6] text-[#9CA3AF]'
                )}
              >
                {complete ? <Check size={16} /> : index + 1}
              </span>
              <span
                className={cn(
                  TypeClass.bodySm,
                  active ? 'font-semibold text-[#1A1A1A]' : complete ? 'text-[#059669]' : 'text-[#9CA3AF]'
                )}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
