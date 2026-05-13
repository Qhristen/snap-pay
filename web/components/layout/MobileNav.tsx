'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useLogoutMutation } from '@/store/api/authApi';
import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation
} from '@/store/api/notificationApi';
import { Modal } from '@/components/ui/Modal';
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

  const { data: notifications = [] } = useGetNotificationsQuery();
  const { data: unreadData } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

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
      <nav className="md:hidden fixed max-w-6xl mx-auto bottom-0 left-0 right-0 z-[100] flex h-20 items-center justify-around border-t border-white/5 bg-background/80 backdrop-blur-xl px-2">
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 transition-all w-full h-full relative group',
            pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-white'
          )}
        >
          {pathname === '/dashboard' && (
            <div className="absolute top-0 h-1 w-8 bg-primary rounded-b-full shadow-[0_4px_12px_rgba(245,166,35,0.3)]" />
          )}
          <div className={cn(
            "p-2 rounded-xl transition-all",
            pathname === '/dashboard' ? "bg-primary/10" : "group-hover:bg-white/5"
          )}>
            <LayoutDashboard size={22} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Home</span>
        </Link>

        {/* Notifications Button */}
        <button
          onClick={() => setIsNotificationsOpen(true)}
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 transition-all w-full h-full relative group',
            isNotificationsOpen ? 'text-primary' : 'text-muted-foreground hover:text-white'
          )}
        >
          {isNotificationsOpen && (
            <div className="absolute top-0 h-1 w-8 bg-primary rounded-b-full shadow-[0_4px_12px_rgba(245,166,35,0.3)]" />
          )}
          <div className={cn(
            "p-2 rounded-xl transition-all relative",
            isNotificationsOpen ? "bg-primary/10" : "group-hover:bg-white/5"
          )}>
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Alerts</span>
        </button>

        <Link
          href="/transactions"
          className={cn(
            'flex flex-col items-center justify-center gap-1.5 transition-all w-full h-full relative group',
            pathname === '/transactions' ? 'text-primary' : 'text-muted-foreground hover:text-white'
          )}
        >
          {pathname === '/transactions' && (
            <div className="absolute top-0 h-1 w-8 bg-primary rounded-b-full shadow-[0_4px_12px_rgba(245,166,35,0.3)]" />
          )}
          <div className={cn(
            "p-2 rounded-xl transition-all",
            pathname === '/transactions' ? "bg-primary/10" : "group-hover:bg-white/5"
          )}>
            <History size={22} />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-tighter">History</span>
        </Link>

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

      {/* Notifications Modal */}
      <Modal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)}
        title="Notifications"
      >
        <div className="flex justify-end mb-4">
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllAsRead()}
              className="text-[10px] font-bold text-primary hover:text-white transition-colors uppercase"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div className="max-h-[50vh] overflow-y-auto -mx-6 px-6">
          {notifications?.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-white/40">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications?.map((n: any) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={cn(
                    "py-4 cursor-pointer transition-colors hover:bg-white/5",
                    !n.isRead ? "bg-primary/5 -mx-6 px-6" : ""
                  )}
                >
                  <div className="flex justify-between gap-4 mb-1">
                    <p className={cn("text-sm font-bold", !n.isRead ? "text-primary" : "text-white/80")}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-white/40 whitespace-nowrap pt-0.5">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
