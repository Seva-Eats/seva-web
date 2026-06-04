'use client';

import { motion } from 'framer-motion';
import { HandHelping, Soup } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import BackNavButton from '@/components/onboarding/BackNavButton';
import ProgressDots from '@/components/onboarding/ProgressDots';
import { RoleChoiceCard } from '@/components/onboarding/RoleChoiceCard';
import { ONBOARDING_TOKENS } from '@/constants/onboarding';
import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';
import { useUser } from '@/context';
import { setOnboardingCompleted } from '@/lib/storage';

export default function Slide2RolePage() {
  const router = useRouter();
  const { setRole } = useUser();

  const skip = async () => {
    await setOnboardingCompleted(true);
    router.replace('/onboarding/sign-in');
  };

  const chooseRecipient = async () => {
    await setRole('recipient');
    router.push('/onboarding/slide3');
  };

  const chooseVolunteer = async () => {
    await setRole('dasher');
    router.push('/onboarding/slide3');
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
          <button
            type="button"
            onClick={skip}
            className={cn(TypeClass.onboardSkip, 'min-w-10 text-right text-[#6B7280]')}
          >
            Skip
          </button>
        </div>

        <div className="flex flex-1 flex-col">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, type: 'spring' }}
            className="mb-6 flex flex-col items-center text-center"
          >
            <span className="rounded-lg bg-[#FFE8D4] px-3 py-[5px]">
              <span className={cn(TypeClass.onboardBadge, 'text-[#F07B2A]')}>YOUR PATH</span>
            </span>
            <h1 className={cn(TypeClass.onboardHeadline, 'mt-3 text-[#15181C]')}>How can we help?</h1>
            <p className={cn(TypeClass.onboardSubtext, 'mt-2 max-w-[300px] text-[#5E646C]')}>
              Choose how you&apos;d like to use Seva Eats. Meals are always free for recipients.
            </p>
          </motion.div>

          <div className="flex flex-col gap-4">
            <RoleChoiceCard
              icon={Soup}
              title="I need a meal"
              description="Request free langar delivered with dignity to a partner drop-off near you."
              tag="Recipient"
              onPress={chooseRecipient}
              delay={0.15}
            />
            <RoleChoiceCard
              icon={HandHelping}
              title="I want to volunteer"
              description="Help cook, pack, pick up, or deliver meals for your community."
              tag="Volunteer"
              onPress={chooseVolunteer}
              delay={0.25}
            />
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={cn(TypeClass.caption, 'mt-6 text-center text-[#9CA3AF]')}
          >
            You can update your role anytime from Profile.
          </motion.p>
        </div>
      </div>
    </AppShell>
  );
}
