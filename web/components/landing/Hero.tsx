'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, ShieldCheck, Globe, Plus, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      
      <div className="mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-2 lg:gap-12 items-center">
        <div className="max-w-2xl text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-bold text-primary mb-6"
          >
            ⚡ Now live in Nigeria
          </motion.div>
          
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
          {/* Floating App Mockup */}
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 mx-auto max-w-[340px] rounded-[3rem] border-8 border-surface bg-surface p-4 shadow-2xl gold-glow"
          >
            {/* Wallet UI Mockup */}
            <div className="h-[580px] w-full rounded-[2.2rem] bg-background overflow-hidden p-6 flex flex-col">
               <div className="flex justify-between items-center mb-8">
                 <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap size={20} className="text-primary" />
                 </div>
                 <div className="flex gap-2">
                    <div className="h-8 w-8 rounded-full bg-white/5" />
                 </div>
               </div>

               <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Total Balance</p>
               <h2 className="text-3xl font-mono font-bold text-white mb-8">₦ 248,500.00</h2>

               <div className="flex gap-4 mb-10">
                  <div className="flex-1 rounded-2xl bg-primary p-3 text-center">
                    <Plus size={20} className="mx-auto text-background mb-1" />
                    <span className="text-[10px] font-bold text-background uppercase">Deposit</span>
                  </div>
                  <div className="flex-1 rounded-2xl bg-white/5 p-3 text-center">
                    <ArrowRight size={20} className="mx-auto text-primary mb-1" />
                    <span className="text-[10px] font-bold text-white uppercase">Transfer</span>
                  </div>
               </div>

               <h3 className="text-sm font-bold text-white mb-4">Recent Activity</h3>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                          <ArrowDownLeft size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">Received from Emeka</p>
                          <p className="text-[10px] text-muted-foreground">Today, 2:45 PM</p>
                       </div>
                    </div>
                    <span className="text-sm font-bold text-success">+₦50,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                          <ArrowUpRight size={18} />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-white">Transfer to Aisha</p>
                          <p className="text-[10px] text-muted-foreground">Yesterday, 11:20 AM</p>
                       </div>
                    </div>
                    <span className="text-sm font-bold text-destructive">-₦12,000</span>
                  </div>
               </div>

               <div className="mt-auto">
                  <Button className="w-full bg-primary text-background font-bold text-xs">Snap Transfer</Button>
               </div>
            </div>
          </motion.div>
          
          {/* Back Glow behind mockup */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[100px]" />
        </motion.div>
      </div>
    </section>
  );
}
