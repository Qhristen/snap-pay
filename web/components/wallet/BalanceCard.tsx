'use client';

import { useState } from 'react';
import { Eye, EyeOff, TrendingUp, Wallet, Zap } from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

export function BalanceCard({ isLoadingWallet }: { isLoadingWallet: boolean }) {
  const [showBalance, setShowBalance] = useState(true);
  const balance = useAppSelector((state) => state.wallet.balance);
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="relative group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-primary/20 blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <Card className="relative overflow-hidden border border-white/5 bg-surface text-white shadow-2xl transition-all duration-500 group-hover:border-primary/20">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Zap className="h-32 w-32 -rotate-12 fill-primary text-primary" />
        </div>
        
        <CardContent className="p-8 md:p-10">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-white/40">
                <p className="text-xs font-bold uppercase tracking-widest">Available Balance</p>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="bg-white/5 p-1.5 transition-hover hover:bg-white/10"
                >
                  {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              
              <AnimatePresence mode="wait">
                <motion.h2
                  key={showBalance ? 'visible' : 'hidden'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-mono text-4xl font-bold tracking-tight md:text-5xl text-white"
                >
                  {isLoadingWallet ? (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin" />
                      <span className="text-white/40 text-sm font-medium">Syncing your wallet...</span>
                    </div>
                  ) : (
                    formatCurrency(balance)
                  )}
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-primary/10 px-4 py-2 border border-primary/20 backdrop-blur-sm">
              <div className="h-2 w-2 bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Live Status</span>
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Account Holder</p>
              <p className="text-lg font-bold text-white tracking-tight">{user?.fullName}</p>
            </div>
            
            <div className="flex items-center gap-4">
               <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 w-8 border-2 border-surface bg-muted flex items-center justify-center text-[10px] font-bold">
                       {i === 3 ? '+' : ''}
                    </div>
                  ))}
               </div>
               <div className="h-8 w-px bg-white/10" />
               <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  <TrendingUp size={16} />
                  <span>Premium Account</span>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
