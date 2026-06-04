'use client';

import { MapPin, Navigation, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import { AppShell } from '@/components/AppShell';
import { RouteMapPlaceholder } from '@/components/seva/RouteMapPlaceholder';
import { SevaFlowHeader } from '@/components/seva/SevaFlowHeader';
import { SevaStickyFooter } from '@/components/seva/SevaStickyFooter';
import { VolunteerStepProgress } from '@/components/seva/VolunteerStepProgress';
import { TypeClass } from '@/constants/typography';
import { useVolunteerRoute } from '@/context/VolunteerRouteContext';
import { buildMapsDirectionsUrl, formatStopAddress } from '@/lib/volunteer-route/helpers';
import { cn } from '@/lib/cn';

const STOP_STEPS = ['Drive to recipient', 'Arrive at door', 'Hand off meals', 'Stop complete'];

export default function SevaStopRoutePage() {
  const router = useRouter();
  const params = useParams<{ stopId: string }>();
  const stopId = params.stopId;
  const { route, advanceStop } = useVolunteerRoute();

  const stop = useMemo(
    () => route.stops.find((s) => s.id === stopId),
    [route.stops, stopId]
  );

  const deliveredCount = route.stops.filter((s) => s.status === 'delivered').length;

  const stepIndex = useMemo(() => {
    if (route.phase === 'stop_drive') return 0;
    if (route.phase === 'stop_arrived') return 1;
    if (route.phase === 'stop_deliver') return 2;
    if (stop?.status === 'delivered') return 3;
    return 0;
  }, [route.phase, stop?.status]);

  const activeStop = route.stops.find((s) => s.status === 'en_route');

  useEffect(() => {
    if (!stop) {
      router.replace('/seva');
      return;
    }
    if (stop.status === 'delivered') {
      router.replace('/seva/route/complete');
      return;
    }
    if (activeStop && activeStop.id !== stop.id && stop.status === 'pending') {
      router.replace(`/seva/route/stop/${activeStop.id}`);
    }
  }, [stop, activeStop, router]);

  if (!stop) {
    return null;
  }

  const address = formatStopAddress(stop);
  const mapsUrl = buildMapsDirectionsUrl(address);

  const primaryLabel =
    route.phase === 'stop_drive'
      ? "I've arrived at the door"
      : route.phase === 'stop_arrived'
        ? 'Start hand-off'
        : route.phase === 'stop_deliver'
          ? 'Complete this delivery'
          : 'Continue';

  const handlePrimary = () => {
    if (route.phase === 'stop_deliver') {
      const nextPending = route.stops.find((s) => s.status === 'pending' && s.id !== stop.id);
      advanceStop();
      if (!nextPending) {
        router.push('/seva/route/complete');
      } else {
        router.push(`/seva/route/stop/${nextPending.id}`);
      }
      return;
    }
    advanceStop();
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFF9F2] pb-36">
        <SevaFlowHeader
          title={`Stop ${stop.sequence}`}
          subtitle={`${deliveredCount} of ${route.totalStops} delivered`}
          backHref="/seva"
        />

        <div className="space-y-4 p-4">
          <RouteMapPlaceholder label="Drop-off" address={address} highlight="dropoff" />

          <VolunteerStepProgress
            steps={STOP_STEPS}
            currentIndex={stepIndex}
            title="Delivery steps"
          />

          <div className="rounded-2xl border-2 border-[#F07B2A] bg-white p-4">
            <p className={cn(TypeClass.label, 'text-[#F07B2A]')}>RECIPIENT</p>
            <p className={cn(TypeClass.sectionTitleSm, 'mt-1 text-[#1A1A1A]')}>
              {stop.recipientName}
            </p>
            <p className={cn(TypeClass.bodySm, 'mt-1 flex items-start gap-1.5 text-[#6B7280]')}>
              <MapPin size={16} className="mt-0.5 shrink-0 text-[#F07B2A]" />
              {address}
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#FFF7ED] px-3 py-2">
              <UtensilsCrossed size={18} className="text-[#F07B2A]" />
              <p className={cn(TypeClass.bodySm, 'font-semibold text-[#1A1A1A]')}>
                {stop.meals} meals for this home
              </p>
            </div>
            {stop.notes && (
              <p className={cn(TypeClass.caption, 'mt-2 text-[#6B7280]')}>
                Note · {stop.notes}
              </p>
            )}
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

          <ul className="rounded-2xl border border-[#E8E3DA] bg-white/80 p-3">
            {route.stops.map((s) => (
              <li
                key={s.id}
                className={cn(
                  TypeClass.caption,
                  'flex justify-between py-1.5',
                  s.id === stop.id && 'font-semibold text-[#F07B2A]',
                  s.status === 'delivered' && 'text-[#059669]'
                )}
              >
                <span>
                  {s.sequence}. {s.recipientName}
                </span>
                <span>
                  {s.status === 'delivered' ? 'Done' : s.id === stop.id ? 'Now' : '—'}
                </span>
              </li>
            ))}
          </ul>
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
