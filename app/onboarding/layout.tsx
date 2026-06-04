import type { ReactNode } from 'react';

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#FAF3EB]">{children}</div>;
}
