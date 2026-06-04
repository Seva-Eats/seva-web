'use client';

import Image from 'next/image';

export function LogoMark({ size = 160 }: { size?: number }) {
  return (
    <Image
      src="/assets/images/logo.png"
      alt="Seva Eats logo"
      width={size}
      height={size}
      priority
      className="object-contain"
    />
  );
}
