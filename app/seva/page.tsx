'use client';

import { Car, MapPin, Navigation, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { SevaFlowHeader } from '@/components/seva/SevaFlowHeader';
import { SevaStickyFooter } from '@/components/seva/SevaStickyFooter';
import { PageLoader } from '@/components/ui/PageLoader';
import { TypeClass } from '@/constants/typography';
import type { VolunteerRouteStatus } from '@/constants/volunteer-deliveries';
import { useVolunteerRoute } from '@/context/VolunteerRouteContext';
import {
  countDeliveredStops,
  formatStopAddress,
  getActiveStop,
  getContinueRoutePath,
} from '@/lib/volunteer-route/helpers';
import { cn } from '@/lib/cn';

const ROUTE_STATUS_LABEL: Record<VolunteerRouteStatus, string> = {
  assigned: 'Ready to start',
  in_progress: 'On your route',
  completed: 'Shift complete',
};

export default function SevaDeliveriesPage() {
  const router = useRouter();
  const { route, startRoute } = useVolunteerRoute();
  const [isStarting, setIsStarting] = useState(false);

  const nextStop = useMemo(() => getActiveStop(route), [route]);
  const deliveredCount = countDeliveredStops(route);
  const continuePath = getContinueRoutePath(route.phase, route);

  const handleStartRoute = async () => {
    setIsStarting(true);
    startRoute();
    await new Promise((r) => setTimeout(r, 400));
    router.push('/seva/route/pickup');
  };

  if (isStarting) {
    return (
      <AppShell>
        <PageLoader message="Preparing your route..." />
      </AppShell>
    );
  }

  const openDirections = () => {
    router.push(continuePath);
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFF9F2] pb-28">
        <SevaFlowHeader title="Tonight's seva" subtitle="Delivery route" />

        <div className="space-y-4 p-4">
          <div className="rounded-2xl border border-[#E8E3DA] bg-[#FFF7ED] p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFE8D4]">
                <Package size={22} className="text-[#F07B2A]" strokeWidth={2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn(TypeClass.label, 'text-[#F07B2A]')}>ACTIVE ROUTE</p>
                <p className={cn(TypeClass.sectionTitleSm, 'mt-0.5 text-[#1A1A1A]')}>
                  {route.label} · {route.totalStops} stops
                </p>
                <p className={cn(TypeClass.bodySm, 'mt-1 text-[#6B7280]')}>
                  {ROUTE_STATUS_LABEL[route.status]}
                  {route.status === 'in_progress' &&
                    ` · ${deliveredCount}/${route.totalStops} delivered`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8E3DA] bg-white p-4 shadow-sm">
            <p className={cn(TypeClass.label, 'text-[#6B7280]')}>Pickup at Gurdwara</p>
            <p className={cn(TypeClass.body, 'mt-1 font-semibold text-[#1A1A1A]')}>
              {route.kitchenName}
            </p>
            <p className={cn(TypeClass.bodySm, 'mt-1 flex items-center gap-1.5 text-[#6B7280]')}>
              <MapPin size={16} className="shrink-0 text-[#F07B2A]" />
              {route.pickupAddress}
            </p>
            <p className={cn(TypeClass.caption, 'mt-2 text-[#9CA3AF]')}>
              Pickup window · {route.pickupAt}
            </p>
          </div>

          {route.status === 'in_progress' && (
            <div className="rounded-2xl border-2 border-[#F07B2A] bg-white p-4">
              <p className={cn(TypeClass.label, 'text-[#F07B2A]')}>
                {nextStop ? 'NEXT STOP' : 'ROUTE'}
              </p>
              {nextStop ? (
                <>
                  <p className={cn(TypeClass.body, 'mt-1 font-semibold text-[#1A1A1A]')}>
                    Stop {nextStop.sequence} · {nextStop.recipientName}
                  </p>
                  <p className={cn(TypeClass.bodySm, 'mt-1 text-[#6B7280]')}>
                    {formatStopAddress(nextStop)}
                  </p>
                  {nextStop.notes && (
                    <p className={cn(TypeClass.caption, 'mt-2 text-[#6B7280]')}>{nextStop.notes}</p>
                  )}
                </>
              ) : (
                <p className={cn(TypeClass.body, 'mt-1 font-semibold text-[#1A1A1A]')}>
                  Head to gurdwara for pickup
                </p>
              )}
              <button
                type="button"
                onClick={openDirections}
                className={cn(
                  TypeClass.btn,
                  'mt-4 flex w-full items-center justify-center gap-2 rounded-[28px] bg-[#F07B2A] py-3.5 font-bold text-white'
                )}
              >
                <Navigation size={18} />
                {nextStop ? 'Continue delivery' : 'Continue route'}
              </button>
            </div>
          )}

          <div>
            <h2 className={cn(TypeClass.sectionTitleSm, 'mb-3 text-[#1A1A1A]')}>
              Delivery stops
            </h2>
            <ul className="space-y-2">
              {route.stops.map((stop) => (
                <li key={stop.id}>
                  {route.status === 'in_progress' &&
                  (stop.status === 'en_route' || stop.status === 'pending') ? (
                    <Link
                      href={`/seva/route/stop/${stop.id}`}
                      className={cn(
                        'flex gap-3 rounded-2xl border bg-white p-3 transition-colors',
                        stop.status === 'en_route'
                          ? 'border-[#F07B2A]'
                          : 'border-[#E8E3DA] hover:border-[#F07B2A]/50'
                      )}
                    >
                      <StopRow stop={stop} />
                    </Link>
                  ) : (
                    <div
                      className={cn(
                        'flex gap-3 rounded-2xl border bg-white p-3',
                        stop.status === 'en_route'
                          ? 'border-[#F07B2A]'
                          : 'border-[#E8E3DA]',
                        stop.status === 'delivered' && 'opacity-60'
                      )}
                    >
                      <StopRow stop={stop} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-[#E8E3DA] bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Car size={18} className="text-[#F07B2A]" />
              <p className={cn(TypeClass.caption)}>
                Live GPS and coordinator routes will replace this preview once dispatch is
                connected. Use Continue route to walk through pickup and each stop.
              </p>
            </div>
          </div>
        </div>

        <SevaStickyFooter>
          {route.status === 'assigned' ? (
            <button
              type="button"
              onClick={() => void handleStartRoute()}
              className={cn(
                TypeClass.btn,
                'flex w-full items-center justify-center rounded-[28px] bg-[#F07B2A] py-4 font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)]'
              )}
            >
              Start route
            </button>
          ) : route.status === 'completed' ? (
            <Link
              href="/seva/route/complete"
              className={cn(
                TypeClass.btn,
                'flex w-full items-center justify-center rounded-[28px] bg-[#059669] py-4 font-bold text-white'
              )}
            >
              View shift summary
            </Link>
          ) : (
            <button
              type="button"
              onClick={openDirections}
              className={cn(
                TypeClass.btn,
                'flex w-full items-center justify-center rounded-[28px] bg-[#F07B2A] py-4 font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)]'
              )}
            >
              Continue route
            </button>
          )}
        </SevaStickyFooter>
      </div>
    </AppShell>
  );
}

function StopRow({
  stop,
}: {
  stop: {
    sequence: number;
    recipientName: string;
    addressLine: string;
    meals: number;
    status: string;
  };
}) {
  return (
    <>
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
          stop.status === 'delivered'
            ? 'bg-[#D1FAE5] text-[#059669]'
            : stop.status === 'en_route'
              ? 'bg-[#FFE8D4] text-[#F07B2A]'
              : 'bg-[#F3F4F6] text-[#6B7280]'
        )}
      >
        {stop.sequence}
      </span>
      <div className="min-w-0 flex-1">
        <p className={cn(TypeClass.body, 'font-semibold text-[#1A1A1A]')}>{stop.recipientName}</p>
        <p className={cn(TypeClass.caption, 'text-[#6B7280]')}>
          {stop.addressLine} · {stop.meals} meals
        </p>
      </div>
      {stop.status === 'delivered' && (
        <span className={cn(TypeClass.micro, 'self-center text-[#059669]')}>Done</span>
      )}
      {stop.status === 'en_route' && (
        <span className={cn(TypeClass.micro, 'self-center text-[#F07B2A]')}>Active</span>
      )}
    </>
  );
}
