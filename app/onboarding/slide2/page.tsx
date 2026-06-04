'use client';

import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import BackNavButton from '@/components/onboarding/BackNavButton';
import ProgressDots from '@/components/onboarding/ProgressDots';
import { ONBOARDING_TOKENS } from '@/constants/onboarding';
import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';
import { useUser } from '@/context';
import { setOnboardingCompleted } from '@/lib/storage';

function RoleOption({
  title,
  subtitle,
  label,
  onPress,
}: {
  title: string;
  subtitle: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="group flex w-full items-center justify-between border-b border-[#E8E3DA]/80 px-1 py-8 text-left transition-colors hover:bg-[#FDF8F3]/60 active:bg-[#FFF4EC]"
    >
      <div className="flex flex-col gap-1.5">
        <span className={cn(TypeClass.roleTitle, 'text-[#15181C]')}>{title}</span>
        <span className={cn(TypeClass.roleSubtitle, 'text-[#6B7280]')}>{subtitle}</span>
        <span className={cn(TypeClass.roleLabel, 'mt-3 text-[#9CA3AF]')}>{label}</span>
      </div>
      <ArrowRight
        size={22}
        className="shrink-0 text-[#D1D5DB] transition-transform group-hover:translate-x-0.5 group-hover:text-[#9CA3AF]"
      />
    </button>
  );
}

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
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 31px, rgba(0,0,0,0.04) 31px, rgba(0,0,0,0.04) 32px)',
          backgroundColor: '#FDFBF7',
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

        <div className="flex flex-1 flex-col justify-center">
          <p className={cn(TypeClass.onboardBadge, 'mb-2 text-center text-[#F07B2A]')}>GET STARTED</p>
          <h1 className={cn(TypeClass.onboardHeadline, 'mb-8 text-center text-[#15181C]')}>
            How can we help?
          </h1>

          <RoleOption
            title="I need a meal"
            subtitle="Request a meal"
            label="Recipient intake"
            onPress={chooseRecipient}
          />
          <RoleOption
            title="I want to volunteer"
            subtitle="Cook, pack, pickup, or deliver"
            label="Approved volunteer"
            onPress={chooseVolunteer}
          />
        </div>
      </div>
    </AppShell>
  );
}
