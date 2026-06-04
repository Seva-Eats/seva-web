'use client';

import { motion } from 'framer-motion';
import { ChevronRight, type LucideIcon } from 'lucide-react';

import { ONBOARDING_COLORS, ONBOARDING_TOKENS } from '@/constants/onboarding';
import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

const ORANGE = ONBOARDING_COLORS.accent;

type RoleChoiceCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  tag: string;
  onPress: () => void;
  delay?: number;
};

export function RoleChoiceCard({
  icon: Icon,
  title,
  description,
  tag,
  onPress,
  delay = 0,
}: RoleChoiceCardProps) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 320, damping: 28 }}
      onClick={onPress}
      className="group flex w-full items-center gap-4 rounded-2xl border-2 border-[#E8E3DA] bg-white p-4 text-left shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all active:scale-[0.99] hover:border-[#F6C48B] hover:shadow-[0_6px_20px_rgba(240,123,42,0.12)]"
      style={{ borderRadius: ONBOARDING_TOKENS.cardRadius }}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: '#FFF2E5' }}
      >
        <Icon size={26} color={ORANGE} strokeWidth={1.75} />
      </div>

      <div className="min-w-0 flex-1">
        <span
          className="mb-2 inline-block rounded-md px-2 py-0.5"
          style={{ backgroundColor: '#FFE8D4' }}
        >
          <span className={cn(TypeClass.onboardBadge, 'text-[10px] tracking-[1.2px] text-[#F07B2A]')}>
            {tag}
          </span>
        </span>
        <p className={cn(TypeClass.onboardStepTitle, 'text-[#1A1A1A]')}>{title}</p>
        <p className={cn(TypeClass.onboardSubtext, 'mt-1 text-[#6B7280]')}>{description}</p>
      </div>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#EDE3DA] bg-[#FAF3EB] transition-colors group-hover:border-[#F6C48B] group-hover:bg-[#FFF4EC]"
      >
        <ChevronRight
          size={18}
          color={ORANGE}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </motion.button>
  );
}
