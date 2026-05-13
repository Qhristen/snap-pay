'use client';

import { motion } from 'framer-motion';
import { Lock, ShieldCheck, History } from 'lucide-react';

const SecurityPoint = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => {
  return (
    <div className="flex gap-4 mb-8">
      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={20} />
      </div>
      <div>
        <h4 className="font-bold text-white mb-1">{title}</h4>
        <p className="text-white/40 text-sm">{description}</p>
      </div>
    </div>
  );
};

export function Security() {
  return (
    <section id="security" className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="font-sora text-4xl font-bold text-white md:text-5xl mb-12">Your money is safe with us.</h2>
          <div className="space-y-4">
            <SecurityPoint 
              icon={Lock} 
              title="JWT Authentication" 
              description="Every session is secured with short-lived signed tokens." 
            />
            <SecurityPoint 
              icon={ShieldCheck} 
              title="bcrypt Password Hashing" 
              description="Your password is never stored in plain text." 
            />
            <SecurityPoint 
              icon={History} 
              title="Audit Logs" 
              description="Every action in your wallet is logged, traceable, and tamper-proof." 
            />
          </div>
        </div>
        <div className="flex justify-center">
           <motion.div
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative"
           >
             <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
             <svg width="300" height="300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 text-primary">
                <motion.path 
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
                <motion.path 
                  d="M9 12l2 2 4-4" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                />
             </svg>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
