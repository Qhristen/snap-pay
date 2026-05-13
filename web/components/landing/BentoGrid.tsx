'use client';

import { motion } from 'framer-motion';
import { Bell, Search, Lock } from 'lucide-react';

export function BentoGrid() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="font-sora text-4xl font-bold text-white md:text-5xl">Designed for clarity. Built for speed.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
          {/* Dashboard Preview */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-8 md:row-span-2 glass rounded-3xl p-8 overflow-hidden relative group cursor-pointer"
          >
            <div className="flex justify-between items-center mb-8">
               <h4 className="font-bold">Dashboard Preview</h4>
               <div className="flex gap-2">
                 <div className="h-8 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">Live Updates</div>
               </div>
            </div>
            <div className="rounded-2xl bg-background/50 border border-white/5 p-6 h-full">
               <div className="flex gap-6 mb-8">
                 <div className="h-32 w-1/2 rounded-2xl bg-gradient-to-br from-primary to-primary/80 p-6 flex flex-col justify-between">
                    <span className="text-white text-xs font-bold uppercase">Balance</span>
                    <span className="text-white/40 text-2xl font-mono font-bold">₦ 248,500.00</span>
                 </div>
                 <div className="h-32 w-1/2 rounded-2xl border border-white/5 bg-white/5 p-6 flex flex-col justify-between">
                    <span className="text-white text-xs font-bold uppercase">Monthly Spent</span>
                    <span className="text-white/40 text-2xl font-mono font-bold">₦ 42,000.00</span>
                 </div>
               </div>
               <div className="space-y-4">
                  {[1, 2].map(i => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="h-8 w-8 rounded-full bg-white/10" />
                      <div className="h-2 w-32 bg-white/10 rounded" />
                      <div className="h-2 w-12 bg-white/10 rounded" />
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>

          {/* Transfer Flow */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 md:row-span-1 glass rounded-3xl p-8 flex flex-col justify-between cursor-pointer"
          >
            <h4 className="font-bold">Transfer Flow</h4>
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="text-primary">01 Amount</span>
              <span>02 Review</span>
              <span>03 Done</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full w-1/3 bg-primary" />
            </div>
          </motion.div>

          {/* Real-time Notifications */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 md:row-span-1 glass rounded-3xl p-8 flex flex-col justify-center cursor-pointer"
          >
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl animate-pulse">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Bell size={20} />
              </div>
              <div>
                <p className="text-xs font-bold">₦25,000 received</p>
                <p className="text-[10px] text-muted-foreground">from Tunde</p>
              </div>
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-6 md:row-span-1 glass rounded-3xl p-8 cursor-pointer"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold">History</h4>
              <Search size={16} className="text-muted-foreground" />
            </div>
            <div className="space-y-3">
               {[
                 { name: 'Spotify', type: 'Sub', amount: '-₦4,500', color: 'text-white' },
                 { name: 'Freelance', type: 'Income', amount: '+₦120,000', color: 'text-success' },
                 { name: 'Aisha', type: 'Sent', amount: '-₦12,000', color: 'text-white' }
               ].map((t, i) => (
                 <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-bold">{t.name}</span>
                    <span className="text-muted-foreground px-2 py-0.5 rounded-full bg-white/5">{t.type}</span>
                    <span className={`font-mono font-bold ${t.color}`}>{t.amount}</span>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Security Badge */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-6 md:row-span-1 glass rounded-3xl p-8 flex items-center justify-center gap-4 cursor-pointer"
          >
            <div className="h-16 w-16 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary">
               <Lock size={32} />
            </div>
            <div>
               <h4 className="font-bold">AES-256 Bit</h4>
               <p className="text-sm text-muted-foreground">Always Protected</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
