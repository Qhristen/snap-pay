'use client';

import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useGetUnreadCountQuery } from '@/store/api/notificationApi';
import { NotificationModal } from './NotificationModal';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: unreadData } = useGetUnreadCountQuery();

  const unreadCount = unreadData?.count || 0;

  return (
    <>
      <div className="relative hidden lg:block">
        <button
          onClick={() => setIsOpen(true)}
          className="relative h-10 w-10 flex items-center cursor-pointer justify-center bg-surface border border-border text-foreground/40 hover:text-foreground transition-colors group"
        >
          <Bell size={18} className="group-hover:scale-110 transition-transform" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background shadow-[0_0_10px_rgba(245,166,35,0.4)]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      <NotificationModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
      />
    </>
  );
}
