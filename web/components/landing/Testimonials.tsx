'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TestimonialCard = ({ quote, author, role, initials }: { quote: string, author: string, role: string, initials: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="flex flex-col border border-border bg-surface p-8 cursor-pointer"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-primary text-primary" />)}
      </div>
      <p className="mb-6 text-lg italic text-foreground/40">"{quote}"</p>
      <div className="mt-auto flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
          {initials}
        </div>
        <div>
          <h4 className="font-bold text-foreground">{author}</h4>
          <p className="text-sm text-foreground/40">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-surface/30 py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="font-sora text-4xl font-bold text-foreground md:text-5xl">Trusted by thousands across Africa.</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <TestimonialCard 
            quote="SnapPay changed how I pay my freelancers. Transfers are instant and I can track everything in one place."
            author="Chidi O."
            role="Product Manager, Lagos"
            initials="CO"
          />
          <TestimonialCard 
            quote="I was skeptical at first but the UI is so clean and my money arrived in seconds. Genuinely impressed."
            author="Amara K."
            role="Designer, Accra"
            initials="AK"
          />
          <TestimonialCard 
            quote="The real-time notifications are a game changer. I always know exactly what's happening with my wallet."
            author="Fatima B."
            role="Entrepreneur, Abuja"
            initials="FB"
          />
        </div>
      </div>
    </section>
  );
}
