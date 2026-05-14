'use client';

import { 
  useGetNotificationsQuery, 
  useGetUnreadCountQuery, 
  useMarkAsReadMutation, 
  useMarkAllAsReadMutation 
} from '@/store/api/notificationApi';
import { cn } from '@/lib/utils';
import { Bell, CheckCheck } from 'lucide-react';

interface NotificationListProps {
  onItemClick?: () => void;
  className?: string;
}

export function NotificationList({ onItemClick, className }: NotificationListProps) {
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const { data: unreadData } = useGetUnreadCountQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  const unreadCount = unreadData?.count || 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs text-foreground/40 animate-pulse">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-primary" />
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">Alerts</h3>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => markAllAsRead()}
            className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-foreground transition-colors uppercase tracking-tight group"
          >
            <CheckCheck size={12} className="group-hover:scale-110 transition-transform" />
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[400px]">
        {notifications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-3">
            <div className="h-12 w-12 bg-foreground/5 flex items-center justify-center rounded-2xl">
              <Bell size={20} className="text-foreground/20" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/60">No notifications</p>
              <p className="text-[10px] text-foreground/30 max-w-[180px] mx-auto mt-1">
                We'll notify you when something important happens.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications?.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.isRead) markAsRead(n.id);
                  onItemClick?.();
                }}
                className={cn(
                  "p-5 cursor-pointer transition-all duration-300 hover:bg-foreground/[0.02] relative group",
                  !n.isRead && "bg-primary/[0.03]"
                )}
              >
                {!n.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_12px_rgba(245,166,35,0.4)]" />
                )}
                <div className="flex justify-between items-start gap-4 mb-1.5">
                  <p className={cn(
                    "text-[11px] font-bold tracking-tight leading-tight", 
                    !n.isRead ? "text-primary" : "text-foreground/60 group-hover:text-foreground/80"
                  )}>
                    {n.title}
                  </p>
                  <span className="text-[9px] font-medium text-foreground/20 whitespace-nowrap pt-0.5 uppercase">
                    {(() => {
                      const diff = Math.ceil((new Date(n.createdAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                      return diff === 0 ? 'Today' : new Intl.RelativeTimeFormat('en', { style: 'narrow' }).format(diff, 'day');
                    })()}
                  </span>
                </div>
                <p className="text-[11px] text-foreground/40 group-hover:text-foreground/50 leading-relaxed line-clamp-2">
                  {n.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
