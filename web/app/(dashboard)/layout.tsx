'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useSocket } from '@/hooks/useSocket';
import { MobileNav } from '@/components/layout/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token } = useAppSelector((state) => state.auth);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize socket connection
  useSocket();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && !token) {
      router.push('/login');
    }
  }, [isHydrated, token, router]);

  // Wait for client-side hydration before making auth decisions
  if (!isHydrated) return null;

  // Only redirect if hydrated and no token
  if (!token) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 md:pb-8">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
