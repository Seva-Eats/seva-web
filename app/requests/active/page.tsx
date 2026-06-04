'use client';

import Link from 'next/link';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { REQUEST_STATUS_LABELS, useRequests } from '@/context';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function ActiveRequestsPage() {
  const colors = useThemeColors();
  const { requests } = useRequests();

  const activeRequests = requests.filter(
    (req) => req.status !== 'delivered' && req.status !== 'cancelled'
  );

  return (
    <AppShell>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <PageHeader title="Active Requests" />
        <div className="flex gap-2 border-b px-4" style={{ borderColor: colors.border }}>
          <Link href="/requests/active" className="border-b-2 px-2 py-2 text-sm font-bold" style={{ borderColor: colors.accent, color: colors.accent }}>
            Active
          </Link>
          <Link href="/requests/history" className="px-2 py-2 text-sm font-semibold" style={{ color: colors.mutedText }}>
            History
          </Link>
        </div>

        <div className="space-y-3 p-4">
          {activeRequests.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: colors.mutedText }}>
              No active requests. Start one from the home flow.
            </p>
          ) : (
            activeRequests.map((req) => (
              <Link
                key={req.id}
                href={`/request/${req.id}`}
                className="block rounded-2xl border p-4"
                style={{ borderColor: colors.border, backgroundColor: colors.surfaceElevated }}
              >
                <p className="font-bold" style={{ color: colors.text }}>
                  {req.pickupLocationName ?? 'Meal request'}
                </p>
                <p className="text-sm" style={{ color: colors.accent }}>
                  {REQUEST_STATUS_LABELS[req.status]}
                </p>
                <p className="text-xs mt-1" style={{ color: colors.mutedText }}>
                  {req.deliveryAddress.address}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
