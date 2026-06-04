'use client';

import { motion } from 'framer-motion';
import {
  Banknote,
  Check,
  FileText,
  Heart,
  MessageCircle,
  Car,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import BackNavButton from '@/components/onboarding/BackNavButton';
import ProgressDots from '@/components/onboarding/ProgressDots';
import { ONBOARDING_COLORS, ONBOARDING_TOKENS } from '@/constants/onboarding';
import { setOnboardingCompleted } from '@/lib/storage';

const ORANGE = ONBOARDING_COLORS.accent;

function SteamStick({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      className="block h-[21px] w-[3px] rounded bg-[#F07B2A]"
      animate={{ y: [0, -8, 0], opacity: [0.45, 1, 0.45] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  );
}

function Sparkle({ className }: { className?: string }) {
  return (
    <motion.span
      className={`absolute h-1.5 w-1.5 rounded-full bg-[#F8BA86] ${className ?? ''}`}
      animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.35, 0.9, 0.35] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function RuleRow({ icon: Icon, label, isLast = false }: { icon: LucideIcon; label: string; isLast?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 py-2.5 ${!isLast ? 'border-b border-[#EFE4DA]' : ''}`}
    >
      <div className="flex w-7 items-center justify-center">
        <Icon size={26} color={ORANGE} strokeWidth={1.75} />
      </div>
      <span className="text-[15px] font-medium tracking-[-0.4px] text-[#1B1D21]">{label}</span>
    </div>
  );
}

function CheckItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFECD9]">
        <Check size={13} color={ORANGE} strokeWidth={3} />
      </div>
      <span className="text-[15px] font-semibold tracking-[-0.3px] text-[#1B1D21]">{label}</span>
    </div>
  );
}

export default function Slide1Page() {
  const router = useRouter();

  const skip = async () => {
    await setOnboardingCompleted(true);
    router.replace('/onboarding/sign-in');
  };

  return (
    <AppShell>
      <div
        className="flex min-h-screen flex-col"
        style={{
          paddingLeft: ONBOARDING_TOKENS.horizontalPadding,
          paddingRight: ONBOARDING_TOKENS.horizontalPadding,
          paddingTop: ONBOARDING_TOKENS.topPadding,
          paddingBottom: ONBOARDING_TOKENS.bottomPadding,
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: ONBOARDING_TOKENS.navBottom }}
        >
          <BackNavButton onPress={() => router.push('/onboarding')} />
          <ProgressDots total={4} current={0} />
          <button type="button" onClick={skip} className="min-w-10 text-right text-[15px] font-medium text-[#6B7280]">
            Skip
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto pb-2">
          <h1
            className="text-center font-extrabold text-[#15181C]"
            style={{
              fontSize: ONBOARDING_TOKENS.titleSize,
              lineHeight: `${ONBOARDING_TOKENS.titleLineHeight}px`,
              letterSpacing: '-1.2px',
            }}
          >
            Access food
            <br />
            without barriers
          </h1>
          <p
            className="mx-auto max-w-[340px] text-center text-[#5E646C]"
            style={{
              fontSize: ONBOARDING_TOKENS.subtitleSize,
              lineHeight: `${ONBOARDING_TOKENS.subtitleLineHeight}px`,
              letterSpacing: '-0.2px',
            }}
          >
            Warm, authentic meals delivered with dignity.
          </p>

          <div
            className="mt-0.5 flex flex-col items-center rounded-2xl px-3 py-3.5"
            style={{ borderRadius: ONBOARDING_TOKENS.cardRadius }}
          >
            <div className="relative mb-2.5 flex h-[124px] w-[124px] flex-col items-center justify-center overflow-visible rounded-full bg-[#FFF2E5]">
              <Sparkle className="left-[18px] top-6" />
              <Sparkle className="right-[18px] top-7" />
              <Sparkle className="bottom-[30px] left-3.5" />
              <Sparkle className="bottom-6 right-3.5" />

              <div className="absolute top-[15px] flex gap-[7px]">
                <SteamStick delay={0} />
                <SteamStick delay={0.2} />
                <SteamStick delay={0.1} />
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-[-1px] h-[9px] w-[82px] rounded-lg border-2 border-[#F07B2A] bg-[#FFF9F2]" />
                <div className="flex h-[58px] w-[72px] items-center justify-center rounded-b-xl rounded-t-md border-2 border-[#F07B2A] bg-[#FFFDFB]">
                  <Heart size={18} color={ORANGE} strokeWidth={1.75} />
                </div>
              </div>
            </div>

            <p className="text-center text-[22px] font-bold leading-[27px] tracking-[-0.5px] text-[#181B1F]">
              Access to meals
            </p>
            <div className="mb-2.5 mt-1 h-[3px] w-7 rounded-sm bg-[#F07B2A]" />

            <div className="flex w-full items-center justify-between">
              <div className="flex flex-1 items-center justify-center gap-2">
                <Car size={18} color={ORANGE} strokeWidth={1.75} />
                <span className="text-[13px] font-medium text-[#535A62]">Free delivery</span>
              </div>
              <div className="mx-2 h-6 w-px bg-[#EDE3DA]" />
              <div className="flex flex-1 items-center justify-center gap-2">
                <Heart size={18} color={ORANGE} strokeWidth={1.75} />
                <span className="text-[13px] font-medium text-[#535A62]">Made with care</span>
              </div>
            </div>
          </div>

          <div>
            <RuleRow icon={FileText} label="No paperwork" />
            <RuleRow icon={MessageCircle} label="No invasive questions" />
            <RuleRow icon={Banknote} label="No cost" isLast />
          </div>

          <div className="flex flex-col gap-[7px]">
            <CheckItem label="100% free" />
            <CheckItem label="Built on dignity and respect" />
          </div>

          <button
            type="button"
            onClick={() => router.push('/onboarding/slide2')}
            className="mt-4 flex w-full items-center justify-center rounded-[28px] text-[17px] font-bold tracking-[0.2px] text-white shadow-[0_8px_16px_rgba(240,123,42,0.32)] active:scale-[0.99]"
            style={{
              height: ONBOARDING_TOKENS.smallCtaHeight,
              backgroundColor: ORANGE,
            }}
          >
            Learn more
          </button>
        </div>
      </div>
    </AppShell>
  );
}
