'use client';

import { Car, MapPin, Navigation, Package } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { AppShell } from '@/components/AppShell';
import { SevaFlowHeader } from '@/components/seva/SevaFlowHeader';
import {
  MOCK_VOLUNTEER_ROUTE,
  type VolunteerActiveRoute,
  type VolunteerRouteStatus,
} from '@/constants/volunteer-deliveries';
import { TypeClass } from '@/constants/typography';
import { cn } from '@/lib/cn';

const ROUTE_STATUS_LABEL: Record<VolunteerRouteStatus, string> = {
  assigned: 'Ready to start',
  in_progress: 'On your route',
  completed: 'Shift complete',
};

export default function SevaDeliveriesPage() {
  const [route, setRoute] = useState<VolunteerActiveRoute>(MOCK_VOLUNTEER_ROUTE);

  const nextStop = useMemo(
    () => route.stops.find((s) => s.status === 'pending' || s.status === 'en_route'),
    [route.stops]
  );

  const startRoute = () => {
    setRoute((prev) => ({
      ...prev,
      status: 'in_progress',
      stops: prev.stops.map((s, i) =>
        i === 0 ? { ...s, status: 'en_route' as const } : s
      ),
    }));
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFF9F2] pb-28">
        <SevaFlowHeader
          title="Tonight's seva"
          subtitle="Delivery route"
        />

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

          {nextStop && route.status === 'in_progress' && (
            <div className="rounded-2xl border-2 border-[#F07B2A] bg-white p-4">
              <p className={cn(TypeClass.label, 'text-[#F07B2A]')}>NEXT STOP</p>
              <p className={cn(TypeClass.body, 'mt-1 font-semibold text-[#1A1A1A]')}>
                {nextStop.recipientName}
              </p>
              <p className={cn(TypeClass.bodySm, 'mt-1 text-[#6B7280]')}>
                {nextStop.addressLine}, {nextStop.city}
              </p>
              {nextStop.notes && (
                <p className={cn(TypeClass.caption, 'mt-2 text-[#6B7280]')}>{nextStop.notes}</p>
              )}
              <button
                type="button"
                className={cn(
                  TypeClass.btn,
                  'mt-4 flex w-full items-center justify-center gap-2 rounded-[28px] bg-[#F07B2A] py-3.5 font-bold text-white'
                )}
              >
                <Navigation size={18} />
                Open directions
              </button>
            </div>
          )}

          <div>
            <h2 className={cn(TypeClass.sectionTitleSm, 'mb-3 text-[#1A1A1A]')}>
              Delivery stops
            </h2>
            <ul className="space-y-2">
              {route.stops.map((stop) => (
                <li
                  key={stop.id}
                  className={cn(
                    'flex gap-3 rounded-2xl border bg-white p-3',
                    stop.status === 'en_route'
                      ? 'border-[#F07B2A]'
                      : 'border-[#E8E3DA]',
                    stop.status === 'delivered' && 'opacity-60'
                  )}
                >
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
                    <p className={cn(TypeClass.body, 'font-semibold text-[#1A1A1A]')}>
                      {stop.recipientName}
                    </p>
                    <p className={cn(TypeClass.caption, 'text-[#6B7280]')}>
                      {stop.addressLine} · {stop.meals} meals
                    </p>
                  </div>
                  {stop.status === 'delivered' && (
                    <span className={cn(TypeClass.micro, 'self-center text-[#059669]')}>
                      Done
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-dashed border-[#E8E3DA] bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[#6B7280]">
              <Car size={18} className="text-[#F07B2A]" />
              <p className={cn(TypeClass.caption)}>
                Optimized routes from the coordinator will appear here once dispatch is live.
                This preview uses sample stops for testing.
              </p>
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-[#E8E3DA] bg-white px-4 pb-8 pt-4">
          {route.status === 'assigned' ? (
            <button
              type="button"
              onClick={startRoute}
              className={cn(
                TypeClass.btn,
                'flex w-full items-center justify-center rounded-[28px] bg-[#F07B2A] py-4 font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)]'
              )}
            >
              Start route
            </button>
          ) : (
            <Link
              href="/seva/profile"
              className={cn(
                TypeClass.btn,
                'flex w-full items-center justify-center rounded-[28px] border border-[#E8E3DA] bg-white py-4 font-semibold text-[#1A1A1A]'
              )}
            >
              Volunteer settings
            </Link>
          )}
        </div>
      </div>
    </AppShell>
  );
}
