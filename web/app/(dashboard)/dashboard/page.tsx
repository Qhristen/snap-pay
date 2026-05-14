'use client';

import { BalanceCard } from '@/components/wallet/BalanceCard';
import { QuickActions } from '@/components/wallet/QuickActions';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetTransactionsQuery } from '@/store/api/transactionApi';
import { useGetBalanceQuery } from '@/store/api/walletApi';
import { setBalance } from '@/store/slices/walletSlice';
import { useEffect } from 'react';

import { NotificationBell } from '@/components/layout/NotificationBell';
import { TransactionCard } from '@/components/wallet/TransactionCard';
import { useLogoutMutation } from '@/store/api/authApi';
import { motion } from 'framer-motion';
import { ChevronRight, History, LogOut, Zap } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  // Fetch initial wallet balance
  const { data: walletData, isLoading: isLoadingWallet } = useGetBalanceQuery();

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
          <p className="text-foreground/40 text-sm font-medium">Your financial overview at a glance.</p>
        </div> */}
        <Link href="/" className="flex items-center gap-2">
          <Zap className="text-primary fill-primary" size={24} />
          <span className="font-sora text-2xl font-bold tracking-tighter">SnapPay</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationBell />
          <button onClick={handleLogout} className="h-10 w-10 cursor-pointer flex items-center justify-center bg-surface border border-border text-foreground/40 hover:text-foreground transition-colors">
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
        <BalanceCard isLoadingWallet={isLoadingWallet} />
      </motion.div>

      {/* Quick Actions */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 bg-primary" />
          <h2 className="font-sora text-xl font-bold">Quick Actions</h2>
        </div>
        <QuickActions />
      </section>

      {/* Recent Transactions */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-primary" />
            <h2 className="font-sora text-xl font-bold">Recent Activity</h2>
          </div>
          <Link href="/transactions" className="flex items-center gap-1 text-sm font-bold text-primary hover:text-gold-glow transition-colors uppercase tracking-tighter">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        <div className="border border-border bg-surface overflow-hidden">
          <div className="p-0">
            {isLoadingTransactions ? (
              <div className="p-12 text-center">
                <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-sm font-medium">Syncing your transactions...</p>
              </div>
            ) : transactionsData?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="h-20 w-20 bg-foreground/5 flex items-center justify-center mb-6">
                  <History className="h-10 w-10 text-foreground/40" />
                </div>
                <h3 className="font-bold text-lg mb-2">No activity yet</h3>
                <p className="text-foreground/40 text-sm max-w-[240px]">Your recent transactions will appear here once you start using your wallet.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
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
