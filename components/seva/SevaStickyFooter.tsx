'use client';

import type { ReactNode } from 'react';

export function SevaStickyFooter({ children }: { children: ReactNode }) {
  return (
    <div className="fixed bottom-0 left-1/2 w-full max-w-[430px] -translate-x-1/2 border-t border-[#E8E3DA] bg-white px-4 pb-8 pt-4">
      {children}
    </div>
  );
}
