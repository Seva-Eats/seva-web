'use client';

import { motion } from 'framer-motion';
import { HeartHandshake, LockOpen, Users, type LucideIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import BackNavButton from '@/components/onboarding/BackNavButton';
import ProgressDots from '@/components/onboarding/ProgressDots';
import { ONBOARDING_COLORS, ONBOARDING_TOKENS } from '@/constants/onboarding';
import { setOnboardingCompleted } from '@/lib/storage';

const ORANGE = ONBOARDING_COLORS.accent;

function Pill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <motion.div
      className="flex items-center gap-[5px] rounded-full bg-[#FFF4EC] px-3 py-[7px]"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Icon size={15} color={ORANGE} strokeWidth={2} />
      <span className="text-[13px] font-medium text-[#4A4A4A]">{label}</span>
    </motion.div>
  );
}

export default function Slide2Page() {
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
          <BackNavButton onPress={() => router.push('/onboarding/slide1')} />
          <ProgressDots total={4} current={1} />
          <button type="button" onClick={skip} className="min-w-10 text-right text-[15px] font-medium text-[#6B7280]">
            Skip
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto pb-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, type: 'spring' }}
            className="self-start rounded-lg bg-[#FFE8D4] px-3 py-[5px]"
          >
            <span className="text-[11px] font-bold tracking-[1.4px] text-[#F07B2A]">DID YOU KNOW</span>
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
            The Tradition
            <br />
            of Langar
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="flex overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            style={{ borderRadius: ONBOARDING_TOKENS.cardRadius }}
          >
            <div className="w-[5px] shrink-0 bg-[#F07B2A]" />
            <div className="flex flex-1 flex-col gap-2.5 p-5">
              <span className="text-[46px] font-black leading-9 text-[#F07B2A]">&ldquo;</span>
              <p className="text-[15px] italic leading-6 text-[#4A4A4A]">
                For over 500 years, Sikh gurdwaras have served langar - a free community kitchen open
                to everyone, regardless of caste, creed, religion, or background. No one leaves
                hungry.
              </p>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-0.5 w-5 rounded-sm bg-[#F07B2A]" />
                <span className="text-xs font-medium text-[#9CA3AF]">The Sikh tradition of Langar</span>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="text-center font-semibold text-[#1A1A1A]"
            style={{
              fontSize: ONBOARDING_TOKENS.subtitleSize,
              lineHeight: `${ONBOARDING_TOKENS.subtitleLineHeight}px`,
            }}
          >
            We bring this 500-year-old tradition to your doorstep with care.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="flex flex-wrap gap-2"
          >
            <Pill icon={Users} label="Community" />
            <Pill icon={HeartHandshake} label="Selfless Service" />
            <Pill icon={LockOpen} label="Open to all" />
          </motion.div>

          <button
            type="button"
            onClick={() => router.push('/onboarding/slide3')}
            className="mt-2.5 flex w-full items-center justify-center rounded-[28px] text-[17px] font-bold tracking-[0.2px] text-white shadow-[0_8px_16px_rgba(240,123,42,0.32)] active:scale-[0.99]"
            style={{
              height: ONBOARDING_TOKENS.smallCtaHeight,
              backgroundColor: ORANGE,
            }}
          >
            Continue
          </button>
        </div>
      </div>
    </AppShell>
  );
}
