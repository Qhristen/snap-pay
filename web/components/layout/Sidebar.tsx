'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  History,
  LogOut,
  User,
  Zap,
  Settings,
  CreditCard,
  Plus
} from 'lucide-react';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useLogoutMutation } from '@/store/api/authApi';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Deposit', href: '/deposit', icon: Plus },
  { label: 'Withdraw', href: '/withdraw', icon: CreditCard },
  { label: 'Transfer', href: '/transfer', icon: Send },
  { label: 'Transactions', href: '/transactions', icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try { await logoutApi().unwrap(); } catch {}
    window.location.href = '/login';
  };

  return (
    <aside className="hidden h-screen w-72 flex-col border-r border-white/5 bg-background md:flex">
      <div className="flex h-24 items-center px-8">
        <Link href="/" className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-primary fill-primary" />
          <span className="font-sora text-2xl font-bold tracking-tighter">SnapPay</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 px-6 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all group relative',
                isActive 
                  ? 'bg-surface text-primary border border-white/5 shadow-lg shadow-primary/5' 
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              )}
            >
              {isActive && <div className="absolute left-0 h-4 w-1 bg-primary rounded-r-full" />}
              <Icon size={20} className={cn("transition-transform group-hover:scale-110", isActive && "text-primary")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 space-y-6">
        <div className="rounded-3xl border border-white/5 bg-surface p-4">
           <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <User size={20} />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold text-white truncate">{user?.fullName}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{user?.email?.split('@')[0]}</span>
              </div>
           </div>
           <div className="flex gap-2">
              <button className="flex-1 h-9 rounded-xl bg-white/5 border border-white/5 text-muted-foreground hover:text-white hover:bg-white/10 transition-all flex items-center justify-center">
                 <Settings size={16} />
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 h-9 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 transition-all flex items-center justify-center"
              >
                 <LogOut size={16} />
              </button>
           </div>
        </div>

        <div className="flex items-center justify-center">
           <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
