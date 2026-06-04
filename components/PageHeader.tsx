'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useThemeColors } from '@/hooks/use-theme-colors';

export function PageHeader({ title, backHref = '/request/location' }: { title: string; backHref?: string }) {
  const router = useRouter();
  const colors = useThemeColors();

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length <= 1) {
      router.replace(backHref);
      return;
    }
    router.back();
  };

  return (
    <header
      className="flex items-center justify-between border-b px-4 py-3"
      style={{ borderColor: colors.border, backgroundColor: colors.background }}
    >
      <button
        type="button"
        onClick={handleBack}
        className="rounded-lg p-1"
        style={{ color: colors.text }}
        aria-label="Go back"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="type-page-header" style={{ color: colors.text }}>
        {title}
      </h1>
      <div className="w-10" />
    </header>
  );
}
