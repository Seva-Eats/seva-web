'use client';

import { Car, Home, MapPin, MessageCircle, Store } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { AppShell } from '@/components/AppShell';
import { RequestFlowHeader } from '@/components/request/RequestFlowHeader';
import { DeliveryProgressStepper } from '@/components/tracking/DeliveryProgressStepper';
import { RequestDetailsCard } from '@/components/tracking/RequestDetailsCard';
import { TypeClass } from '@/constants/typography';
import { REQUEST_STATUS_LABELS, useRequests } from '@/context';
import { cn } from '@/lib/cn';
import {
  markTrackingNotificationsPrompted,
  requestTrackingNotificationsPermission,
  shouldPromptForTrackingNotifications,
} from '@/lib/notifications';

export default function RequestTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { getRequest, cancelRequest } = useRequests();

  const request = typeof id === 'string' ? getRequest(id) : undefined;
  const isDelivered = request?.status === 'delivered';
  const isCancelled = request?.status === 'cancelled';
  const isComplete = isDelivered || isCancelled;

  const eta = request?.estimatedDelivery
    ? request.estimatedDelivery.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null;

  const handleCancel = () => {
    if (!request || !id) return;
    if (confirm('Cancel this request?')) {
      cancelRequest(id);
      router.push('/requests/active');
    }
  };

  useEffect(() => {
    let active = true;

    const promptForNotifications = async () => {
      if (!request) return;
      if (request.status === 'delivered' || request.status === 'cancelled') return;

      const shouldPrompt = await shouldPromptForTrackingNotifications();
      if (!shouldPrompt || !active) return;

      const wantsNotifications = window.confirm(
        'Enable delivery updates?\n\nWe can notify you when your meal is delivered.'
      );
      if (!active) return;

      if (wantsNotifications) {
        await requestTrackingNotificationsPermission();
      } else {
        await markTrackingNotificationsPrompted(false);
      }
    };

    void promptForNotifications();

    return () => {
      active = false;
    };
  }, [request]);

  if (isDelivered) {
    return (
      <AppShell>
        <div className="min-h-screen bg-[#FFF9F2] pb-28">
          <RequestFlowHeader
            title="Delivered!"
            useCloseIcon
            closeHref="/request/location"
          />

          <div className="flex flex-col items-center px-4 pt-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#10B981]">
              <span className="text-4xl font-bold text-white">✓</span>
            </div>
            <h2 className={cn(TypeClass.statusTitle, 'mt-4 text-2xl text-[#059669]')}>Meal Delivered!</h2>
            <p className={cn(TypeClass.statusSubtitle, 'mt-2 max-w-[300px] text-[#6B7280]')}>
              Thank you for using Seva Eats. We hope you enjoy your meal!
            </p>
          </div>

          <div className="mt-6 space-y-4 px-4">
            {request && <DeliveryProgressStepper status={request.status} />}
            <RequestDetailsCard
              name={request.recipientName}
              phone={request.recipientPhone}
              deliveryAddress={request.deliveryAddress.address}
              servingSize={request.servingSize}
            />
          </div>

          <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 px-4 pb-8">
            <Link
              href="/request/location"
              className={cn(TypeClass.btn, 'flex w-full items-center justify-center rounded-[28px] bg-[#F07B2A] py-4 font-bold text-white shadow-[0_6px_14px_rgba(240,123,42,0.35)]')}
            >
              Back to Home
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-[#FFF9F2] pb-28">
        <RequestFlowHeader
          title="Tracking"
          useCloseIcon
          closeHref="/request/location"
        />

        <div className="px-4 pt-4">
          <h2 className={cn(TypeClass.statusTitle, 'text-2xl text-[#1A1A1A]')}>
            {request ? REQUEST_STATUS_LABELS[request.status] : 'Finding a Driver'}
          </h2>
          {!isComplete && (
            <p className={cn(TypeClass.statusSubtitle, 'mt-1 flex items-center gap-1.5 text-[#6B7280]')}>
              <span className="text-[#F07B2A]">⏱</span>
              Estimated arrival:{' '}
              <span className="font-semibold text-[#1A1A1A]">
                {eta ?? 'Calculating...'}
              </span>
            </p>
          )}

          {request && (
            <div className="mt-4 space-y-4">
              <DeliveryProgressStepper status={request.status} />

              <div className="overflow-hidden rounded-2xl border border-[#E8E3DA] bg-[#E5E7EB]">
                <div className="relative h-44 bg-gradient-to-br from-[#D1FAE5] via-[#F3F4F6] to-[#DBEAFE]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Store size={36} className="text-[#F07B2A]" />
                  </div>
                </div>
                <div className={cn(TypeClass.captionXs, 'flex items-center gap-2 border-t border-[#E8E3DA] bg-white px-4 py-3')}>
                  <MapPin size={14} className="text-[#F07B2A]" />
                  <span className="font-semibold text-[#1A1A1A]">
                    {request.pickupLocationName ?? 'Brampton Hub'}
                  </span>
                  <span className="text-[#D1D5DB]">— —</span>
                  <Car size={12} className="text-[#9CA3AF]" />
                  <span className="text-[#D1D5DB]">— —</span>
                  <Home size={14} className="text-[#10B981]" />
                  <span className="truncate font-semibold text-[#1A1A1A]">
                    {request.deliveryAddress.address}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#E8E3DA] bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EFF6FF] text-lg">
                    🙂
                  </div>
                  <div>
                    <p className={cn(TypeClass.caption, 'text-[#6B7280]')}>Need help?</p>
                    <p className={cn(TypeClass.body, 'font-semibold text-[#1A1A1A]')}>Contact support</p>
                  </div>
                </div>
                <Link
                  href="/support"
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F07B2A] text-white"
                  aria-label="Contact support"
                >
                  <MessageCircle size={22} />
                </Link>
              </div>

              <RequestDetailsCard
                name={request.recipientName}
                phone={request.recipientPhone}
                deliveryAddress={request.deliveryAddress.address}
                servingSize={request.servingSize}
              />
            </div>
          )}

          {!request && (
            <div className="mt-4 rounded-2xl border border-[#E8E3DA] bg-white p-5">
              <p className="text-sm text-[#6B7280]">
                We could not find that request.
              </p>
              <Link href="/requests/active" className="mt-2 inline-block text-sm font-semibold text-[#F07B2A]">
                View active requests
              </Link>
            </div>
          )}
        </div>

        {request && !isComplete && (
          <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 px-4 pb-8">
            <button
              type="button"
              onClick={handleCancel}
              className={cn(TypeClass.btnSm, 'w-full rounded-[28px] border-2 border-[#EF4444] bg-white py-3.5 font-semibold text-[#EF4444] active:scale-[0.99]')}
            >
              Cancel Request
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
