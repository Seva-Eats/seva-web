'use client';

import { CheckCircle2, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AppShell } from '@/components/AppShell';
import { SevaFlowHeader } from '@/components/seva/SevaFlowHeader';
import { SevaStickyFooter } from '@/components/seva/SevaStickyFooter';
import { TypeClass } from '@/constants/typography';
import { useVolunteerRoute } from '@/context/VolunteerRouteContext';
import { cn } from '@/lib/cn';

export default function SevaRouteCompletePage() {
  const router = useRouter();
  const { route, resetRoute } = useVolunteerRoute();

  useEffect(() => {
    if (route.status !== 'completed' && route.phase !== 'route_done') {
      router.replace('/seva');
    }
  }, [route.status, route.phase, router]);

  const handleDone = () => {
    resetRoute();
    router.push('/seva');
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFF9F2] pb-36">
        <SevaFlowHeader title="Seva complete" subtitle={route.label} backHref="/seva" />

        <div className="flex flex-col items-center px-6 py-10 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#D1FAE5]">
            <CheckCircle2 size={44} className="text-[#059669]" strokeWidth={2} />
          </span>
          <h2 className={cn(TypeClass.sectionTitle, 'mt-6 text-[#1A1A1A]')}>
            All {route.totalStops} meals delivered
          </h2>
          <p className={cn(TypeClass.body, 'mt-2 max-w-[300px] text-[#6B7280]')}>
            Thank you for serving with dignity tonight. Families received langar from{' '}
            {route.kitchenName}.
          </p>
          <p className={cn(TypeClass.caption, 'mt-4 flex items-center gap-1.5 text-[#F07B2A]')}>
            <Heart size={16} />
            Waheguru ji ka Khalsa, Waheguru ji ki Fateh
          </p>
        </div>

        <SevaStickyFooter>
          <button
            type="button"
            onClick={handleDone}
            className={cn(
              TypeClass.btn,
              'flex w-full items-center justify-center rounded-[28px] bg-[#F07B2A] py-4 font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)]'
            )}
          >
            Back to seva home
          </button>
          <Link
            href="/seva/profile"
            className={cn(TypeClass.caption, 'mt-3 block text-center text-[#6B7280] underline')}
          >
            Volunteer settings
          </Link>
        </SevaStickyFooter>
      </div>
    </AppShell>
  );
}
