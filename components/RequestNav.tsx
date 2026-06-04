'use client';

import { User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useThemeColors } from '@/hooks/use-theme-colors';

export function RequestNav() {
  const pathname = usePathname();
  const colors = useThemeColors();

  return (
    <nav
      className="flex items-center justify-between border-b px-4 py-3"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <Link href="/request/location" className="text-lg font-extrabold" style={{ color: colors.accent }}>
        Seva Eats
      </Link>
      <div className="flex gap-2">
        <Link
          href="/requests/active"
          className="rounded-lg px-2 py-1 text-xs font-semibold"
          style={{
            color: pathname.startsWith('/requests') ? colors.accent : colors.mutedText,
          }}
        >
          Requests
        </Link>
        <Link href="/profile" className="rounded-lg p-2" style={{ color: colors.text }} aria-label="Profile">
          <User size={22} />
        </Link>
      </div>
    </nav>
  );
}
