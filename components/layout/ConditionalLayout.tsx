'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

export default function ConditionalLayout({
  navbar,
  footer,
  children
}: {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Profile veya Admin sayfasındayken üst/alt menüleri gizle
  const isPanel = pathname.startsWith('/profile') || pathname.startsWith('/admin');

  if (isPanel) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      <div className="min-h-[calc(100vh-140px)]">{children}</div>
      {footer}
    </>
  );
}