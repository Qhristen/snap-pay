'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { 
  useGetNotificationsQuery, 
  useGetUnreadCountQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation 
} from '@/store/api/notificationApi';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications = [] } = useGetNotificationsQuery();
  const { data: unreadData } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const unreadCount = unreadData?.count || 0;

  return (
    <div className="relative hidden lg:block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-10 w-10 flex items-center cursor-pointer justify-center bg-surface border border-white/5 text-white/40 hover:text-white transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-2 z-50 w-80 overflow-hidden border border-white/10 bg-surface shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-white/5">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllAsRead()}
                    className="text-[10px] font-bold text-primary hover:text-white transition-colors uppercase"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[350px] overflow-y-auto">
                {notifications?.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-xs text-white/40">No notifications yet</p>
                  </div>
                ) : (
                  notifications?.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => !n.isRead && markAsRead(n.id)}
                      className={cn(
                        "p-4 border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5",
                        !n.isRead && "bg-primary/5"
                      )}
                    >
                      <div className="flex justify-between gap-2">
                        <p className={cn("text-xs font-bold", !n.isRead ? "text-primary" : "text-white/60")}>
                          {n.title}
                        </p>
                        <span className="text-[9px] text-white/20 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-white/40 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
