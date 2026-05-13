'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { BentoGrid } from '@/components/landing/BentoGrid';
import { Testimonials } from '@/components/landing/Testimonials';
import { Security } from '@/components/landing/Security';
import { CTABanner } from '@/components/landing/CTABanner';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <main>
        <Hero />
        {/* <StatsBar /> */}
        <Features />
        <HowItWorks />
        {/* <BentoGrid /> */}
        <Testimonials />
        <Security />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
