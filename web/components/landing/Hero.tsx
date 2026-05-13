'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ShieldCheck, Globe, Plus, ArrowDownLeft, ArrowUpRight, EyeOff, TrendingUp, Send, CreditCard, History } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-38 md:pb-32">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      
      <div className="mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-12 items-center">
        <div className="max-w-2xl text-center lg:text-left">
                
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-sora text-5xl font-extrabold leading-none tracking-tight text-white md:text-7xl"
          >
            Send Money at the <span className="text-primary">Speed of a Snap.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-white/40 md:text-xl"
          >
            SnapPay is the all-in-one digital wallet built for speed, simplicity, and security. Deposit, withdraw, and transfer money instantly — anytime, anywhere.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full bg-primary text-background hover:bg-gold-glow font-bold text-lg px-8">Create Free Account</Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="ghost" className="w-full gap-2 text-white hover:bg-white/5">
                See How It Works <ArrowRight size={20} />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mt-12 flex flex-wrap justify-center lg:justify-start gap-8"
          >
            <div className="flex items-center gap-2 text-sm text-white/40">
              <ShieldCheck size={16} className="text-primary" /> Bank-grade Security
            </div>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Zap size={16} className="text-primary" /> Instant Transfers
            </div>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Globe size={16} className="text-primary" /> Pan-African Ready
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 lg:mt-0 relative"
        >
          {/* Dashboard Web Mockup */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 mx-auto w-full max-w-[500px] border border-white/5 bg-background/50 p-6 backdrop-blur-2xl shadow-2xl gold-glow flex flex-col gap-6"
          >
               {/* Balance Card Mock */}
               <div className="relative overflow-hidden border border-white/5 bg-surface text-white flex-shrink-0">
                 <div className="absolute top-0 right-0 p-6 opacity-5">
                   <Zap className="h-28 w-28 -rotate-12 fill-primary text-primary" />
                 </div>
                 
                 <div className="p-8 relative z-10">
                   <div className="flex items-start justify-between">
                     <div className="space-y-3">
                       <div className="flex items-center gap-2 text-muted-foreground">
                         <p className="text-xs font-bold uppercase tracking-widest">Available Balance</p>
                         <div className="rounded-full bg-white/5 p-1.5">
                           <EyeOff size={14} />
                         </div>
                       </div>
                       <h2 className="font-mono text-4xl font-bold tracking-tight text-white">₦ 248,500.00</h2>
                     </div>

                     <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-primary/10 px-4 py-2 border border-primary/20 backdrop-blur-sm">
                       <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                       <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Live Status</span>
                     </div>
                   </div>

                   <div className="mt-10 flex items-end justify-between gap-6">
                     <div className="space-y-1">
                       <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Account Holder</p>
                       <p className="text-base font-bold text-white tracking-tight">John Doe</p>
                     </div>
                     
                     <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                           {[1, 2, 3].map(i => (
                             <div key={i} className="h-8 w-8 rounded-full border-2 border-surface bg-muted flex items-center justify-center text-[10px] font-bold">
                                {i === 3 ? '+' : ''}
                             </div>
                           ))}
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex items-center gap-2 text-primary font-bold text-sm">
                           <TrendingUp size={16} />
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
                   { label: 'Transfer', icon: Send, color: 'text-white', bg: 'bg-white/5' },
                   { label: 'Withdraw', icon: CreditCard, color: 'text-white', bg: 'bg-white/5' },
                   { label: 'History', icon: History, color: 'text-white', bg: 'bg-white/5' },
                 ].map((action) => (
                   <div
                     key={action.label}
                     className="flex flex-col items-center gap-3 p-4 border border-white/5 bg-surface transition-all hover:border-primary/20 cursor-pointer"
                   >
                     <div className={`flex h-12 w-12 items-center justify-center ${action.bg} border border-white/5`}>
                       <action.icon className={`h-5 w-5 ${action.color}`} />
                     </div>
                     <span className="text-[10px] sm:text-xs font-bold text-white/40 tracking-tight uppercase">{action.label}</span>
                   </div>
                 ))}
               </div>
          </motion.div>
          
          {/* Back Glow behind mockup */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
        </motion.div>
      </div>
    </section>
  );
}
