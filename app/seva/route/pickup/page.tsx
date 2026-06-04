'use client';

import { MapPin, Navigation, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { AppShell } from '@/components/AppShell';
import { RouteMapPlaceholder } from '@/components/seva/RouteMapPlaceholder';
import { SevaFlowHeader } from '@/components/seva/SevaFlowHeader';
import { SevaStickyFooter } from '@/components/seva/SevaStickyFooter';
import { VolunteerStepProgress } from '@/components/seva/VolunteerStepProgress';
import { TypeClass } from '@/constants/typography';
import { useVolunteerRoute } from '@/context/VolunteerRouteContext';
import { buildMapsDirectionsUrl } from '@/lib/volunteer-route/helpers';
import { cn } from '@/lib/cn';

const PICKUP_STEPS = ['Head to gurdwara', 'Arrive & load meals', 'Start deliveries'];

export default function SevaPickupRoutePage() {
  const router = useRouter();
  const { route, advancePickup } = useVolunteerRoute();

  const stepIndex = useMemo(() => {
    if (route.phase === 'pickup_drive') return 0;
    if (route.phase === 'pickup_arrived') return 1;
    if (route.phase === 'stop_drive' || route.phase === 'stop_arrived' || route.phase === 'stop_deliver') {
      return 2;
    }
    return 0;
  }, [route.phase]);

  useEffect(() => {
    if (route.status === 'assigned' && route.phase === 'idle') {
      router.replace('/seva');
    }
  }, [route.status, route.phase, router]);

  const mapsUrl = buildMapsDirectionsUrl(route.pickupAddress);

  const primaryLabel =
    route.phase === 'pickup_drive'
      ? "I've arrived at the gurdwara"
      : 'Meals loaded — start deliveries';

  const handlePrimary = () => {
    if (route.phase === 'pickup_arrived') {
      const firstStopId = route.stops[0]?.id;
      advancePickup();
      if (firstStopId) router.push(`/seva/route/stop/${firstStopId}`);
      return;
    }
    advancePickup();
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFF9F2] pb-36">
        <SevaFlowHeader title="Pickup" subtitle={route.kitchenName} backHref="/seva" />

        <div className="space-y-4 p-4">
          <RouteMapPlaceholder
            label="Pickup location"
            address={route.pickupAddress}
            highlight="pickup"
          />

          <VolunteerStepProgress steps={PICKUP_STEPS} currentIndex={stepIndex} title="Pickup progress" />

          <div className="rounded-2xl border border-[#E8E3DA] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE8D4]">
                <Package size={22} className="text-[#F07B2A]" strokeWidth={2} />
              </span>
              <div>
                <p className={cn(TypeClass.label, 'text-[#F07B2A]')}>LANGAR PICKUP</p>
                <p className={cn(TypeClass.body, 'mt-1 font-semibold text-[#1A1A1A]')}>
                  {route.kitchenName}
                </p>
                <p className={cn(TypeClass.bodySm, 'mt-1 flex items-center gap-1.5 text-[#6B7280]')}>
                  <MapPin size={16} className="shrink-0 text-[#F07B2A]" />
                  {route.pickupAddress}
                </p>
                <p className={cn(TypeClass.caption, 'mt-2 text-[#9CA3AF]')}>
                  Window · {route.pickupAt} · {route.totalStops} stops after pickup
                </p>
              </div>
            </div>
          </div>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              TypeClass.btn,
              'flex w-full items-center justify-center gap-2 rounded-[28px] border border-[#E8E3DA] bg-white py-3.5 font-semibold text-[#1A1A1A]'
            )}
          >
            <Navigation size={18} className="text-[#F07B2A]" />
            Open in Maps
          </a>
        </div>

        <SevaStickyFooter>
          <button
            type="button"
            onClick={handlePrimary}
            className={cn(
              TypeClass.btn,
              'flex w-full items-center justify-center rounded-[28px] bg-[#F07B2A] py-4 font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)]'
            )}
          >
            {primaryLabel}
          </button>
          <Link
            href="/seva"
            className={cn(TypeClass.caption, 'mt-3 block text-center text-[#6B7280] underline')}
          >
            Back to route overview
          </Link>
        </SevaStickyFooter>
      </div>
    </AppShell>
  );
}
