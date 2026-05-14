'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLogoutMutation } from '@/store/api/authApi';
import { useGetUnreadCountQuery } from '@/store/api/notificationApi';
import { NotificationModal } from './NotificationModal';
import { useState } from 'react';
import {
  LayoutDashboard,
  History,
  LogOut,
  Bell
} from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();
  const [logoutApi] = useLogoutMutation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.count || 0;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // onQueryStarted in authApi already clears state and storage
    }
    window.location.href = '/login';
  };

  return (
    <>
      <nav className="md:hidden fixed max-w-6xl mx-auto bottom-0 left-0 right-0 z-[100] flex h-20 items-center justify-around border-t border-border bg-background/80 backdrop-blur-xl px-2">
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 transition-all w-full h-full relative group',
            pathname === '/dashboard' ? 'text-primary' : 'text-foreground/40 hover:text-foreground'
          )}
        >
          {pathname === '/dashboard' && (
            <div className="absolute top-0 h-1 w-8 bg-primary shadow-[0_4px_12px_rgba(245,166,35,0.3)]" />
          )}
          <div className={cn(
            "p-2 transition-all",
            pathname === '/dashboard' ? "bg-primary/10" : "group-hover:bg-foreground/5"
          )}>
            <LayoutDashboard size={22} />
          </div>
          <span className="text-[9px] font-bold uppercase text-foreground/40 tracking-tighter">Home</span>
        </Link>

        {/* Notifications Button */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 transition-all w-full h-full relative group',
            isNotificationsOpen ? 'text-primary' : 'text-foreground/40 hover:text-foreground'
          )}
        >
          {isNotificationsOpen && (
            <div className="absolute top-0 h-1 w-8 bg-primary shadow-[0_4px_12px_rgba(245,166,35,0.3)]" />
          )}
          <div className={cn(
            "p-2 transition-all relative",
            isNotificationsOpen ? "bg-primary/10" : "group-hover:bg-foreground/5"
          )}>
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background shadow-[0_0_10px_rgba(245,166,35,0.4)]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase text-foreground/40 tracking-tighter">Alerts</span>
        </button>

        <Link
          href="/transactions"
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 transition-all w-full h-full relative group',
            pathname === '/transactions' ? 'text-primary' : 'text-foreground/40 hover:text-foreground'
          )}
        >
          {pathname === '/transactions' && (
            <div className="absolute top-0 h-1 w-8 bg-primary shadow-[0_4px_12px_rgba(245,166,35,0.3)]" />
          )}
          <div className={cn(
            "p-2 transition-all",
            pathname === '/transactions' ? "bg-primary/10" : "group-hover:bg-foreground/5"
          )}>
            <History size={22} />
          </div>
          <span className="text-[9px] font-bold uppercase text-foreground/40 tracking-tighter">History</span>
        </Link>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center gap-1.5 transition-all w-full h-full relative group text-foreground/40 hover:text-foreground"
        >
          <div className="p-2 transition-all group-hover:bg-foreground/5">
            <LogOut size={22} />
          </div>
          <span className="text-[9px] font-bold uppercase text-foreground/40 tracking-tighter">Logout</span>
        </button>
      </nav>

      <NotificationModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </>
  );
}
