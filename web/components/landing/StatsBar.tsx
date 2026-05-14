'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const StatCounter = ({ value, label }: { value: string, label: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className="flex flex-col items-center justify-center p-6 text-center"
    >
      <span className="font-mono text-3xl font-bold text-primary md:text-4xl">{value}</span>
      <span className="mt-2 text-sm text-foreground/40 uppercase tracking-widest">{label}</span>
    </motion.div>
  );
};

export function StatsBar() {
  return (
    <section className="border-y border-border bg-surface/50 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatCounter value="50,000+" label="Active Users" />
          <StatCounter value="₦2.4B+" label="Processed" />
          <StatCounter value="99.9%" label="Uptime" />
          <StatCounter value="< 3s" label="Transfer Speed" />
        </div>
      </div>
    </section>
  );
}
