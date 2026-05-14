'use client';

import { motion } from 'framer-motion';
import { Bell, Search, Lock, Zap, EyeOff, TrendingUp, Plus, Send, CreditCard, History } from 'lucide-react';

export function BentoGrid() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="font-sora text-4xl font-bold text-foreground md:text-5xl">Designed for clarity. Built for speed.</h2>
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
            <div className="rounded-2xl bg-background/50 border border-border p-6 h-full overflow-hidden flex flex-col gap-6">
               {/* Balance Card Mock */}
               <div className="relative overflow-hidden border border-border bg-surface text-foreground rounded-xl flex-shrink-0">
                 <div className="absolute top-0 right-0 p-6 opacity-5">
                   <Zap className="h-24 w-24 -rotate-12 fill-primary text-primary" />
                 </div>
                 
                 <div className="p-6 relative z-10">
                   <div className="flex items-start justify-between">
                     <div className="space-y-2">
                       <div className="flex items-center gap-2 text-muted-foreground">
                         <p className="text-[10px] font-bold uppercase tracking-widest">Available Balance</p>
                         <div className="rounded-full bg-foreground/5 p-1">
                           <EyeOff size={12} />
                         </div>
                       </div>
                       <h2 className="font-mono text-3xl font-bold tracking-tight text-foreground">₦ 248,500.00</h2>
                     </div>

                     <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-primary/10 px-3 py-1.5 border border-primary/20 backdrop-blur-sm">
                       <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                       <span className="text-[8px] font-bold text-primary uppercase tracking-tighter">Live Status</span>
                     </div>
                   </div>

                   <div className="mt-8 flex items-end justify-between gap-6">
                     <div className="space-y-1">
                       <p className="text-[8px] font-bold text-foreground/40 uppercase tracking-widest">Account Holder</p>
                       <p className="text-sm font-bold text-foreground tracking-tight">John Doe</p>
                     </div>
                     
                     <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                           {[1, 2, 3].map(i => (
                             <div key={i} className="h-6 w-6 rounded-full border-2 border-surface bg-muted flex items-center justify-center text-[8px] font-bold">
                                {i === 3 ? '+' : ''}
                             </div>
                           ))}
                        </div>
                        <div className="h-6 w-px bg-foreground/10" />
                        <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                           <TrendingUp size={12} />
                           <span>Premium</span>
                        </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Quick Actions Mock */}
               <div className="grid grid-cols-4 gap-4 flex-shrink-0">
                 {[
                   { label: 'Deposit', icon: Plus, color: 'text-primary', bg: 'bg-primary/10' },
                   { label: 'Transfer', icon: Send, color: 'text-foreground', bg: 'bg-foreground/5' },
                   { label: 'Withdraw', icon: CreditCard, color: 'text-foreground', bg: 'bg-foreground/5' },
                   { label: 'History', icon: History, color: 'text-foreground', bg: 'bg-foreground/5' },
                 ].map((action) => (
                   <div
                     key={action.label}
                     className="flex flex-col items-center gap-2 p-3 border border-border bg-surface transition-all rounded-xl"
                   >
                     <div className={`flex h-10 w-10 items-center justify-center ${action.bg} border border-border rounded-xl`}>
                       <action.icon className={`h-4 w-4 ${action.color}`} />
                     </div>
                     <span className="text-[10px] font-bold text-foreground/40 tracking-tight uppercase">{action.label}</span>
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
            <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
               <div className="h-full w-1/3 bg-primary" />
            </div>
          </motion.div>

          {/* Real-time Notifications */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 md:row-span-1 glass rounded-3xl p-8 flex flex-col justify-center cursor-pointer"
          >
            <div className="flex items-center gap-4 bg-foreground/5 border border-border p-4 rounded-2xl animate-pulse">
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
                 { name: 'Spotify', type: 'Sub', amount: '-₦4,500', color: 'text-foreground' },
                 { name: 'Freelance', type: 'Income', amount: '+₦120,000', color: 'text-success' },
                 { name: 'Aisha', type: 'Sent', amount: '-₦12,000', color: 'text-foreground' }
               ].map((t, i) => (
                 <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-bold">{t.name}</span>
                    <span className="text-muted-foreground px-2 py-0.5 rounded-full bg-foreground/5">{t.type}</span>
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
