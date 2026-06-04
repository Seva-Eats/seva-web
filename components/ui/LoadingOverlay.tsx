'use client';

export function LoadingOverlay({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="rounded-2xl bg-white px-8 py-6 shadow-lg">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#F07B2A] border-t-transparent" />
        <p className="text-center text-sm font-semibold text-[#1A1A1A]">{message}</p>
      </div>
    </div>
  );
}
