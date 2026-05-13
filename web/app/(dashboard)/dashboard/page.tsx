'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { setBalance } from '@/store/slices/walletSlice';
import { BalanceCard } from '@/components/wallet/BalanceCard';
import { QuickActions } from '@/components/wallet/QuickActions';
import { useGetBalanceQuery } from '@/store/api/walletApi';
import { useGetTransactionsQuery } from '@/store/api/transactionApi';

import { formatCurrency, cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Send, History, Search, Filter, ChevronRight, LogOut, Icon, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLogoutMutation } from '@/store/api/authApi';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Fetch initial wallet balance
  const { data: walletData } = useGetBalanceQuery();

  // Logout
  const [logoutApi] = useLogoutMutation();
  

  // Fetch recent transactions
  const { data: transactionsResponse, isLoading: isLoadingTransactions } = useGetTransactionsQuery({ limit: 5 });
  const transactionsData = transactionsResponse?.data;

  useEffect(() => {
    if (walletData?.balance !== undefined) {
      dispatch(setBalance(walletData.balance));
    }
  }, [walletData, dispatch]);


  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // onQueryStarted in authApi already clears state and storage
    }
    window.location.href = '/login';
  };

  return (
    <div className="space-y-10 pb-10 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-sora text-3xl font-extrabold tracking-tight md:text-4xl">
            Welcome back, <span className="text-primary">{user?.fullName?.split(' ')[0]}</span>
          </h1>
          <p className="text-white/40 text-sm font-medium">Your financial overview at a glance.</p>
        </div>
        <div className="flex items-center gap-3">
           <Link href="/dashboard" className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface border border-white/5 text-muted-foreground hover:text-white transition-colors">
              <LayoutDashboard size={18} />
           </Link>
           <button onClick={handleLogout} className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface border border-white/5 text-muted-foreground hover:text-white transition-colors">
              <LogOut size={18} />
           </button>
        </div>
      </header>

      {/* Balance Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <BalanceCard />
      </motion.div>

      {/* Quick Actions */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
           <div className="h-1 w-8 bg-primary rounded-full" />
           <h2 className="font-sora text-xl font-bold">Quick Actions</h2>
        </div>
        <QuickActions />
      </section>

      {/* Recent Transactions */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="h-1 w-8 bg-primary rounded-full" />
             <h2 className="font-sora text-xl font-bold">Recent Activity</h2>
          </div>
          <Link href="/transactions" className="flex items-center gap-1 text-sm font-bold text-primary hover:text-gold-glow transition-colors uppercase tracking-tighter">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="border border-white/5 bg-surface overflow-hidden shadow-2xl">
          <div className="p-0">
            {isLoadingTransactions ? (
              <div className="p-12 text-center">
                 <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                 <p className="text-muted-foreground text-sm font-medium">Syncing your transactions...</p>
              </div>
            ) : transactionsData?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                   <History className="h-10 w-10 text-white/40" />
                </div>
                <h3 className="font-bold text-lg mb-2">No activity yet</h3>
                <p className="text-white/40 text-sm max-w-[240px]">Your recent transactions will appear here once you start using your wallet.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {transactionsData?.map((tx: any, index: number) => {
                  const type = tx.type.toLowerCase();
                  const isCredit = type === 'deposit' || type === 'transfer_received' || type === 'credit';
                  const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;

                  return (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-6 transition-all hover:bg-white/[0.02] group"
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center border border-white/5 transition-transform group-hover:scale-110",
                          isCredit ? "bg-success/10 text-success" : "bg-white/5 text-white"
                        )}>
                          {(type === 'deposit' || type === 'transfer_received') && <ArrowDownLeft className="h-6 w-6" />}
                          {(type === 'withdrawal' || type === 'transfer_sent') && <ArrowUpRight className="h-6 w-6" />}
                          {type === 'transfer' && <Send className="h-6 w-6" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold tracking-tight text-white">{tx.description || tx.type.replace('_', ' ')}</p>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                            {new Date(tx.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-base font-mono font-bold tracking-tighter",
                          isCredit ? "text-success" : "text-white"
                        )}>
                          {isCredit ? '+' : '-'}{formatCurrency(amount)}
                        </p>
                        <div className="h-1 w-4 bg-white/5 rounded-full ml-auto mt-2" />
                      </div>
                    </motion.div>
                  );
                })}

              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
