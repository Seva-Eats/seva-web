'use client';

import { motion } from 'framer-motion';
import { HeartHandshake, MapPin, UtensilsCrossed, type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import BackNavButton from '@/components/onboarding/BackNavButton';
import ProgressDots from '@/components/onboarding/ProgressDots';
import { ONBOARDING_COLORS, ONBOARDING_TOKENS } from '@/constants/onboarding';
import { setOnboardingCompleted } from '@/lib/storage';

const ORANGE = ONBOARDING_COLORS.accent;

const STEPS = [
  {
    title: 'Choose Your Meal',
    desc: 'Browse available meals from\nlocal donors and restaurants',
    icon: UtensilsCrossed,
  },
  {
    title: 'Confirm Delivery',
    desc: 'Set your preferred pickup\nlocation and time',
    icon: MapPin,
  },
  {
    title: 'Receive with Dignity',
    desc: 'Get your meal delivered with\ncare and respect',
    icon: HeartHandshake,
  },
];

export default function Slide3Page() {
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
          <BackNavButton onPress={() => router.push('/onboarding/slide2')} />
          <ProgressDots total={4} current={2} />
          <button type="button" onClick={skip} className="min-w-10 text-right text-[15px] font-medium text-[#6B7280]">
            Skip
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3.5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="self-center rounded-lg bg-[#FFE8D4] px-3 py-[5px]"
          >
            <span className="text-[11px] font-bold tracking-[1.4px] text-[#F07B2A]">SIMPLE PROCESS</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="text-center font-extrabold text-[#1A1A1A]"
            style={{
              fontSize: ONBOARDING_TOKENS.titleSize,
              lineHeight: `${ONBOARDING_TOKENS.titleLineHeight}px`,
              letterSpacing: '-0.8px',
            }}
          >
            How It Works
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mb-2 text-center text-[#6B7280]"
            style={{
              fontSize: ONBOARDING_TOKENS.subtitleSize,
              lineHeight: `${ONBOARDING_TOKENS.subtitleLineHeight}px`,
            }}
          >
            Access nutritious meals in 3 easy steps
          </motion.p>

          <div className="flex flex-col">
            {STEPS.map((step, i) => (
              <StepRow key={step.title} step={step} index={i} isLast={i === STEPS.length - 1} />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => router.push('/onboarding/sign-in')}
          className="flex w-full items-center justify-center rounded-[28px] text-[17px] font-bold tracking-[0.3px] text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)] active:scale-[0.985]"
          style={{
            height: ONBOARDING_TOKENS.smallCtaHeight,
            backgroundColor: ORANGE,
          }}
        >
          Next
        </button>
      </div>
    </AppShell>
  );
}

function StepRow({
  step,
  index,
  isLast,
}: {
  step: { title: string; desc: string; icon: LucideIcon };
  index: number;
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + index * 0.15, type: 'spring' }}
      className="flex gap-3.5"
    >
      <div className="relative flex w-14 flex-col items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#F6C48B] bg-[#FAF3EB]">
          <span className="text-lg font-extrabold text-[#F07B2A]">{`0${index + 1}`}</span>
        </div>
        {!isLast && (
          <div className="absolute left-[27px] top-16 h-16 w-0.5 bg-[#F6C48B]" />
        )}
      </div>

      <div className={`flex-1 ${!isLast ? 'mb-7' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#FAEFE6]">
            <Icon size={22} color={ORANGE} strokeWidth={1.75} />
          </div>
          <h3 className="text-[19px] font-bold leading-6 tracking-[-0.3px] text-[#1D2321]">
            {step.title}
          </h3>
        </div>
        <p className="ml-[62px] whitespace-pre-line text-sm leading-[22px] text-[#6B7280]">
          {step.desc}
        </p>
      </div>
    </motion.div>
  );
}
