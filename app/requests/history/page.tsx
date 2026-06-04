'use client';

import Link from 'next/link';

import { AppShell } from '@/components/AppShell';
import { PageHeader } from '@/components/PageHeader';
import { REQUEST_STATUS_LABELS, useRequests } from '@/context';
import { useThemeColors } from '@/hooks/use-theme-colors';

export default function HistoryRequestsPage() {
  const colors = useThemeColors();
  const { requests } = useRequests();

  const history = requests.filter(
    (req) => req.status === 'delivered' || req.status === 'cancelled'
  );

  return (
    <AppShell>
      <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
        <PageHeader title="Request History" />
        <div className="flex gap-2 border-b px-4" style={{ borderColor: colors.border }}>
          <Link href="/requests/active" className="px-2 py-2 text-sm font-semibold" style={{ color: colors.mutedText }}>
            Active
          </Link>
          <Link href="/requests/history" className="border-b-2 px-2 py-2 text-sm font-bold" style={{ borderColor: colors.accent, color: colors.accent }}>
            History
          </Link>
        </div>

        <div className="space-y-3 p-4">
          {history.length === 0 ? (
            <p className="text-center text-sm py-8" style={{ color: colors.mutedText }}>
              No past requests yet.
            </p>
          ) : (
            history.map((req) => (
              <Link
                key={req.id}
                href={`/request/${req.id}`}
                className="block rounded-2xl border p-4"
                style={{ borderColor: colors.border, backgroundColor: colors.surfaceElevated }}
              >
                <p className="font-bold" style={{ color: colors.text }}>
                  {req.pickupLocationName ?? 'Meal request'}
                </p>
                <p className="text-sm" style={{ color: colors.mutedText }}>
                  {REQUEST_STATUS_LABELS[req.status]}
                </p>
                <p className="text-xs mt-1" style={{ color: colors.mutedText }}>
                  {new Date(req.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
