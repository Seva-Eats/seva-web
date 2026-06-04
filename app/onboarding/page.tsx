'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import { LogoMark } from '@/components/LogoMark';
import { TypeClass } from '@/constants/typography';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/cn';

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const colors = useThemeColors();

  return (
    <AppShell>
      <div
        className="flex min-h-screen flex-col items-center justify-center px-6 py-12"
        style={{ backgroundColor: colors.background }}
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <LogoMark size={160} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center px-2 text-center"
          >
            <h1 className={cn(TypeClass.heroTitle, 'text-center')} style={{ color: colors.text }}>
              Request a free langar
              <br />
              meal near you
            </h1>
            <p
              className={cn(TypeClass.heroSubtitle, 'mt-2 max-w-[320px] text-center')}
              style={{ color: colors.mutedText }}
            >
              Food is shared with dignity. No payment, no paperwork.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8 w-full"
        >
          <button
            type="button"
            onClick={() => router.push('/onboarding/slide1')}
            className={cn('type-hero-cta w-full rounded-[28px] py-3.5 text-white shadow-md active:scale-[0.99]')}
            style={{ backgroundColor: colors.accent }}
          >
            Get Started
          </button>
        </motion.div>
      </div>
    </AppShell>
  );
}
