'use client';

import type { ReactNode } from 'react';

export function AppShell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto min-h-screen w-full max-w-[430px] ${className}`}>{children}</div>
  );
}
