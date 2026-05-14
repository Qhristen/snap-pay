'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function CTABanner() {
  return (
    <section className="py-24 px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mx-auto max-w-7xl premium-gradient p-12 md:p-24 text-center relative overflow-hidden"
      >
        <div className="relative z-10">
          <h2 className="font-sora text-4xl font-extrabold text-background md:text-6xl mb-6">Your wallet. Your speed. Your SnapPay.</h2>
          <p className="text-background/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-medium">Join 50,000+ users already sending money the smart way.</p>
          <Link href="/register">
            <Button size="lg" className="bg-background text-primary hover:bg-foreground/90 font-bold text-xl px-12 py-8 h-auto">
              Create Your Free Wallet <ChevronRight className="ml-2" />
            </Button>
          </Link>
        </div>
        
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 h-64 w-64 rounded-full bg-foreground/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-foreground/10 blur-3xl" />
      </motion.div>
    </section>
  );
}
