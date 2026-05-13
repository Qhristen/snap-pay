'use client';

import { motion } from 'framer-motion';
import { Zap, ShieldCheck, TrendingUp, Bell, History } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, index }: { icon: React.ElementType, title: string, description: string, index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="group relative border border-white/5 bg-surface p-8 transition-all  cursor-pointer"
    >
      <div className="absolute top-0 left-0 h-1 w-0 bg-primary transition-all duration-500 group-hover:w-full" />
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
        <Icon size={24} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-white/40 leading-relaxed">{description}</p>
    </motion.div>
  );
};

export function Features() {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="font-sora text-4xl font-bold text-white md:text-5xl">Everything your wallet should be.</h2>
          <p className="mt-4 text-lg text-white/40">Built with the tools modern users demand — speed, transparency, and control.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={Zap} 
            title="Instant Transfers" 
            description="Send money to any SnapPay user in under 3 seconds, 24/7." 
            index={0}
          />
          <FeatureCard 
            icon={ShieldCheck} 
            title="Bank-Grade Security" 
            description="JWT auth, bcrypt encryption, and audit logs keep your funds safe." 
            index={1}
          />
          <FeatureCard 
            icon={TrendingUp} 
            title="Real-Time Balance" 
            description="Your wallet balance updates the moment a transaction completes." 
            index={2}
          />
          <FeatureCard 
            icon={Bell} 
            title="Live Notifications" 
            description="Get instant alerts for every deposit, withdrawal, and transfer received." 
            index={3}
          />
          <FeatureCard 
            icon={History} 
            title="Full Transaction History" 
            description="Filter, search, and paginate through every naira that's moved." 
            index={4}
          />
          <FeatureCard 
            icon={Zap} 
            title="Zero Hidden Fees" 
            description="What you send is what arrives. Transparent pricing, always." 
            index={5}
          />
        </div>
      </div>
    </section>
  );
}
