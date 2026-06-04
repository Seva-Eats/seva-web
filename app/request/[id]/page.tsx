'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { REQUEST_STATUS_LABELS, type MealRequestStatus, useRequests } from '@/context';
import { useThemeColors } from '@/hooks/use-theme-colors';

const STATUS_STEPS: { status: MealRequestStatus; label: string }[] = [
  { status: 'pending', label: 'Finding driver' },
  { status: 'matched', label: 'Driver matched' },
  { status: 'picked_up', label: 'Meal picked up' },
  { status: 'on_the_way', label: 'On the way' },
  { status: 'delivered', label: 'Delivered' },
];

const statusTone: Record<MealRequestStatus, string> = {
  pending: '#F59E0B',
  matched: '#2563EB',
  picked_up: '#7C3AED',
  on_the_way: '#EA580C',
  delivered: '#059669',
  cancelled: '#DC2626',
};

function getStepIndex(status: MealRequestStatus) {
  const stepIndex = STATUS_STEPS.findIndex((step) => step.status === status);
  if (stepIndex >= 0) return stepIndex;
  return 0;
}

export default function RequestTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const { getRequest, cancelRequest } = useRequests();

  const request = typeof id === 'string' ? getRequest(id) : undefined;
  const isComplete = request ? request.status === 'delivered' || request.status === 'cancelled' : false;
  const stepIndex = request ? getStepIndex(request.status) : 0;
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

  return (
    <AppShell>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <PageHeader title="Request Tracking" backHref="/requests/active" />
        <div className="p-4">
          <div
            className="rounded-2xl border p-5"
            style={{ backgroundColor: colors.surface, borderColor: colors.border }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
              Request ID
            </p>
            <p className="text-lg font-bold" style={{ color: colors.text }}>
              {request?.id ?? id ?? 'Unknown'}
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
              Status
            </p>
            <p className="text-lg font-bold" style={{ color: request ? statusTone[request.status] : colors.accent }}>
              {request ? REQUEST_STATUS_LABELS[request.status] : 'Pending'}
            </p>

            {!isComplete && eta && (
              <p className="mt-2 text-sm" style={{ color: colors.mutedText }}>
                Estimated arrival: <span style={{ color: colors.text, fontWeight: 700 }}>{eta}</span>
              </p>
            )}

            {request?.volunteerName && (
              <>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                  Volunteer
                </p>
                <p style={{ color: colors.text }}>{request.volunteerName}</p>
              </>
            )}

            {request?.pickupLocationName && (
              <>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                  Pickup Hub
                </p>
                <p style={{ color: colors.text }}>{request.pickupLocationName}</p>
              </>
            )}

            {request?.deliveryAddress && (
              <>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: colors.mutedText }}>
                  Delivery Address
                </p>
                <p style={{ color: colors.text }}>{request.deliveryAddress.address}</p>
              </>
            )}
          </div>

          {request && (
            <div
              className="mt-4 rounded-2xl border p-4"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <p className="text-sm font-bold" style={{ color: colors.text }}>
                Delivery Progress
              </p>

              <div className="mt-3 space-y-3">
                {STATUS_STEPS.map((step, index) => {
                  const isDone = index < stepIndex || request.status === 'delivered';
                  const isCurrent = index === stepIndex && request.status !== 'delivered';
                  return (
                    <div key={step.status} className="flex items-center gap-3">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor: isDone || isCurrent ? statusTone[step.status] : colors.border,
                        }}
                      />
                      <p
                        className="text-sm"
                        style={{
                          color: isDone || isCurrent ? colors.text : colors.mutedText,
                          fontWeight: isCurrent ? 700 : 500,
                        }}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {request && request.selectedMeals.length > 0 && (
            <div
              className="mt-4 rounded-2xl border p-4"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <p className="text-sm font-bold" style={{ color: colors.text }}>
                Request Details
              </p>
              <div className="mt-2 space-y-1 text-sm" style={{ color: colors.mutedText }}>
                {request.selectedMeals.map((meal) => (
                  <p key={meal.id}>
                    {meal.quantity}x {meal.name}
                  </p>
                ))}
              </div>
              <p className="mt-3 text-sm" style={{ color: colors.mutedText }}>
                Serving size: <span style={{ color: colors.text, fontWeight: 600 }}>{request.servingSize}</span>
              </p>
              <p className="text-sm" style={{ color: colors.mutedText }}>
                Delivery window: <span style={{ color: colors.text, fontWeight: 600 }}>{request.deliveryWindow}</span>
              </p>
              <p className="text-sm" style={{ color: colors.mutedText }}>
                Preference:{' '}
                <span style={{ color: colors.text, fontWeight: 600 }}>
                  {request.deliveryPreference === 'leave_at_door' ? 'Leave at door' : 'Hand to me'}
                </span>
              </p>
              {typeof request.donationAmount === 'number' && request.donationAmount > 0 && (
                <p className="text-sm" style={{ color: colors.mutedText }}>
                  Donation: <span style={{ color: colors.text, fontWeight: 600 }}>${request.donationAmount}</span>
                </p>
              )}
            </div>
          )}

          {request && request.statusHistory.length > 0 && (
            <div
              className="mt-4 rounded-2xl border p-4"
              style={{ backgroundColor: colors.surface, borderColor: colors.border }}
            >
              <p className="text-sm font-bold" style={{ color: colors.text }}>
                Status Timeline
              </p>
              <div className="mt-2 space-y-2">
                {[...request.statusHistory].reverse().map((entry, index) => (
                  <div key={`${entry.status}-${index}`} className="flex items-center justify-between text-sm">
                    <p style={{ color: colors.text }}>{REQUEST_STATUS_LABELS[entry.status]}</p>
                    <p style={{ color: colors.mutedText }}>
                      {entry.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!request && (
            <div
              className="mt-4 rounded-2xl border p-5"
              style={{ borderColor: colors.border, backgroundColor: colors.surfaceElevated }}
            >
              <p className="text-sm" style={{ color: colors.mutedText }}>
                We could not find that request. Open your active requests to continue tracking.
              </p>
              <Link href="/requests/active" className="mt-3 inline-block text-sm font-semibold" style={{ color: colors.accent }}>
                View Active Requests
              </Link>
            </div>
          )}

          {request && !['delivered', 'cancelled'].includes(request.status) && (
            <button
              type="button"
              onClick={handleCancel}
              className="mt-4 w-full rounded-xl border py-3 font-bold text-red-600"
              style={{ borderColor: colors.border }}
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
