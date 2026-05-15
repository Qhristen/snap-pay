'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useLogoutMutation } from '@/store/api/authApi';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Moon, 
  Sun,
  Settings,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const user = useAppSelector((state) => state.auth.user);
  const { theme, setTheme } = useTheme();
  const [logoutApi] = useLogoutMutation();

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 cursor-pointer h-10 px-2 border border-border bg-surface hover:bg-foreground/5 transition-colors"
      >
        <div className="h-7 w-7 bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
          {getInitials(user?.fullName)}
        </div>
        <ChevronDown size={14} className={cn("text-foreground/40 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 border border-border bg-background shadow-lg overflow-hidden z-50"
          >
            {/* User Info */}
            <div className="p-4 border-b border-border bg-surface/50">
              <p className="font-bold text-sm truncate">{user?.fullName || 'User'}</p>
              <p className="text-xs text-foreground/60 truncate">{user?.email}</p>
            </div>

            <div className="p-2 space-y-1">
              <Link 
                href="/audit-logs" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 cursor-pointer w-full px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <Shield size={16} />
                Audit Logs
              </Link>
              
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 cursor-pointer w-full px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <UserIcon size={16} />
                Profile (Coming soon)
              </Link>

              <button 
                onClick={() => {
                  setTheme(theme === 'light' ? 'dark' : 'light');
                }}
                className="flex items-center cursor-pointer justify-between w-full px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-foreground/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  Theme
                </div>
                <span className="text-[10px] uppercase font-bold text-foreground/40">
                  {theme}
                </span>
              </button>
            </div>

            <div className="p-2 border-t border-border">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 cursor-pointer w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
