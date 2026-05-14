
import { MobileNav } from '@/components/layout/MobileNav';
import { Suspense } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-24 md:pb-8">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-8">
          <Suspense>
          {children}
          </Suspense>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
