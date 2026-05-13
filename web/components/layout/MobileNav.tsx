'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLogoutMutation } from '@/store/api/authApi';
import {
  LayoutDashboard,
  History,
  LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'History', href: '/transactions', icon: History },
];

export function MobileNav() {
  const pathname = usePathname();
  const [logoutApi] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // onQueryStarted in authApi already clears state and storage
    }
    window.location.href = '/login';
  };

  return (
    <nav className="fixed max-w-6xl mx-auto bottom-0 left-0 right-0 z-[100] flex h-20 items-center justify-around border-t border-white/5 bg-background/80 backdrop-blur-xl px-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 transition-all w-full h-full relative group',
              isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
            )}
          >
            {isActive && (
              <div className="absolute top-0 h-1 w-8 bg-primary rounded-b-full shadow-[0_4px_12px_rgba(245,166,35,0.3)]" />
            )}
            <div className={cn(
              "p-2 rounded-xl transition-all",
              isActive ? "bg-primary/10" : "group-hover:bg-white/5"
            )}>
              <Icon size={22} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
          </Link>
        );
      })}

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center gap-1.5 transition-all w-full h-full relative group text-muted-foreground hover:text-white"
      >
        <div className="p-2 rounded-xl transition-all group-hover:bg-white/5">
          <LogOut size={22} />
        </div>
        <span className="text-[9px] font-bold uppercase tracking-tighter">Logout</span>
      </button>
    </nav>
  );
}
