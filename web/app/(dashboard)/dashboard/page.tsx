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
import { ArrowDownLeft, ArrowUpRight, Send, History, Search, Filter, ChevronRight, LogOut, Icon, LayoutDashboard, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLogoutMutation } from '@/store/api/authApi';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { TransactionCard } from '@/components/wallet/TransactionCard';

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
      <header className="flex gap-2 items-center justify-between">
        {/* <div>
          <h1 className="font-sora text-3xl font-extrabold tracking-tight md:text-4xl">
            Welcome back, <span className="text-primary">{user?.fullName?.split(' ')[0]}</span>
          </h1>
          <p className="text-white/40 text-sm font-medium">Your financial overview at a glance.</p>
        </div> */}
        <Link href="/" className="flex items-center gap-2">
          <Zap className="text-primary fill-primary" size={24} />
          <span className="font-sora text-2xl font-bold tracking-tighter">SnapPay</span>
        </Link>
        <div className="flex items-center gap-3">
          {/* <Link href="/dashboard" className="h-10 w-10 hidden items-center justify-center bg-surface border border-white/5 text-white/40 hover:text-white transition-colors lg:flex">
            <LayoutDashboard size={18} />
          </Link> */}
          <NotificationBell />
          <button onClick={handleLogout} className="h-10 w-10 flex items-center justify-center bg-surface border border-white/5 text-white/40 hover:text-white transition-colors">
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
                {transactionsData?.map((tx: any, index: number) => (
                  <TransactionCard key={tx.id} transaction={tx} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
