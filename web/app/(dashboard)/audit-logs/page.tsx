'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useGetAuditLogsQuery, AuditLog } from '@/store/api/auditApi';
import {
  LayoutDashboard,
  Shield,
  LogIn,
  LogOut,
  KeyRound,
  ArrowDownLeft,
  ArrowUpRight,
  Send,
  UserCog,
  Activity,
  Globe,
  Monitor,
  ChevronDown,
  Filter,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ACTION_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'PASSWORD_CHANGE', label: 'Password' },
  { value: 'DEPOSIT', label: 'Deposit' },
  { value: 'WITHDRAWAL', label: 'Withdrawal' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'PROFILE_UPDATE', label: 'Profile' },
];

function getActionIcon(action: string) {
  const a = action.toUpperCase();
  if (a === 'LOGIN') return <LogIn className="h-5 w-5" />;
  if (a === 'LOGOUT') return <LogOut className="h-5 w-5" />;
  if (a === 'PASSWORD_CHANGE') return <KeyRound className="h-5 w-5" />;
  if (a === 'DEPOSIT') return <ArrowDownLeft className="h-5 w-5" />;
  if (a === 'WITHDRAWAL') return <ArrowUpRight className="h-5 w-5" />;
  if (a === 'TRANSFER') return <Send className="h-5 w-5" />;
  if (a === 'PROFILE_UPDATE') return <UserCog className="h-5 w-5" />;
  return <Activity className="h-5 w-5" />;
}

function getActionColor(action: string) {
  const a = action.toUpperCase();
  if (a === 'LOGIN') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (a === 'LOGOUT') return 'bg-foreground/5 text-foreground/60 border-border';
  if (a === 'PASSWORD_CHANGE') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  if (a === 'DEPOSIT') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
  if (a === 'WITHDRAWAL') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  if (a === 'TRANSFER') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
  if (a === 'PROFILE_UPDATE') return 'bg-violet-500/10 text-violet-500 border-violet-500/20';
  return 'bg-foreground/5 text-foreground/40 border-border';
}

function getActionLabel(action: string) {
  return action
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function AuditLogCard({ log, index }: { log: AuditLog; index: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasDetails = log.oldValue || log.newValue || log.ipAddress || log.userAgent;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group"
    >
      <button
        onClick={() => hasDetails && setIsExpanded(!isExpanded)}
        className={cn(
          "w-full flex items-center justify-between p-5 md:p-6 transition-all text-left",
          hasDetails && "hover:bg-foreground/[0.02] cursor-pointer",
          !hasDetails && "cursor-default"
        )}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center border transition-transform",
              hasDetails && "group-hover:scale-110",
              getActionColor(log.action)
            )}
          >
            {getActionIcon(log.action)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold tracking-tight text-foreground">
                {getActionLabel(log.action)}
              </p>
              <span className="rounded-full px-2 py-0.5 text-[8px] font-bold uppercase border bg-foreground/5 text-foreground/40 border-border">
                {log.entity}
              </span>
            </div>
            <p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest mt-1">
              {new Date(log.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-[9px] text-foreground/20 font-mono">
            {log.entityId?.slice(0, 8)}
          </span>
          {hasDetails && (
            <ChevronDown
              size={14}
              className={cn(
                "text-foreground/20 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && hasDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-5 md:px-6 md:pb-6 ml-[60px] space-y-3">
              {/* IP and Device info */}
              {(log.ipAddress || log.userAgent) && (
                <div className="flex flex-wrap gap-4 text-[10px] font-mono text-foreground/30">
                  {log.ipAddress && (
                    <div className="flex items-center gap-1.5">
                      <Globe size={10} />
                      <span>{log.ipAddress}</span>
                    </div>
                  )}
                  {log.userAgent && (
                    <div className="flex items-center gap-1.5 max-w-xs truncate">
                      <Monitor size={10} className="shrink-0" />
                      <span className="truncate">{log.userAgent}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Value changes */}
              {(log.oldValue || log.newValue) && (
                <div className="grid gap-2 md:grid-cols-2">
                  {log.oldValue && (
                    <div className="p-3 border border-border bg-foreground/[0.02]">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 mb-2">
                        Previous Value
                      </p>
                      <pre className="text-[11px] font-mono text-foreground/60 whitespace-pre-wrap break-all leading-relaxed">
                        {JSON.stringify(log.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.newValue && (
                    <div className="p-3 border border-emerald-500/20 bg-emerald-500/[0.03]">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500/60 mb-2">
                        New Value
                      </p>
                      <pre className="text-[11px] font-mono text-foreground/60 whitespace-pre-wrap break-all leading-relaxed">
                        {JSON.stringify(log.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useGetAuditLogsQuery({
    page,
    limit: 10,
    action: action === 'ALL' ? undefined : action,
  });

  const logs = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-foreground/40 text-sm">
              Track every action on your account.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard"
          className="h-10 w-10 flex items-center justify-center bg-surface border border-border text-foreground/40 hover:text-foreground transition-colors"
        >
          <LayoutDashboard size={18} />
        </Link>
      </div>

      {/* Filter Toggle + Active Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter size={14} />
            Filters
            {action !== 'ALL' && (
              <span className="ml-1 h-4 w-4 flex items-center justify-center text-[9px] bg-primary text-background font-bold">
                1
              </span>
            )}
          </Button>
          {action !== 'ALL' && (
            <button
              onClick={() => { setAction('ALL'); setPage(1); }}
              className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border border-border bg-foreground/5 text-foreground/60 hover:bg-foreground/10 transition-colors cursor-pointer"
            >
              {getActionLabel(action)}
              <X size={10} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pb-2">
                {ACTION_FILTERS.map((f) => (
                  <Button
                    key={f.value}
                    variant={action === f.value ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setAction(f.value);
                      setPage(1);
                    }}
                    className="capitalize text-xs"
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logs List */}
      <Card className="premium-card overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-16">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin" />
              <p className="mt-4 text-foreground/40 text-sm">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="h-20 w-20 bg-foreground/5 flex items-center justify-center mb-6">
                <Shield className="h-10 w-10 text-foreground/20" />
              </div>
              <h3 className="font-bold text-lg mb-2">No audit logs found</h3>
              <p className="text-foreground/40 text-sm max-w-[280px]">
                {action !== 'ALL'
                  ? 'No logs match the selected filter. Try a different action type.'
                  : 'Your account activity will appear here as you interact with SnapPay.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {logs.map((log, index) => (
                <AuditLogCard key={log.id} log={log} index={index} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-xs text-foreground/40">
            Showing page{' '}
            <span className="text-foreground font-bold">{page}</span> of{' '}
            <span className="text-foreground font-bold">{totalPages}</span>
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="h-8 w-8 p-0 border-border bg-foreground/5 hover:bg-foreground/10"
            >
              <span className="sr-only">Previous</span>
              &larr;
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - page) <= 1
              )
              .map((p, i, arr) => (
                <div key={p} className="flex items-center">
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="px-2 text-foreground/20 text-xs">...</span>
                  )}
                  <Button
                    variant={page === p ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={cn(
                      'h-8 w-8 p-0 text-xs font-bold',
                      page === p
                        ? ''
                        : 'border-border bg-foreground/5 hover:bg-foreground/10 text-foreground/40 hover:text-foreground'
                    )}
                  >
                    {p}
                  </Button>
                </div>
              ))}

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="h-8 w-8 p-0 border-border bg-foreground/5 hover:bg-foreground/10"
            >
              <span className="sr-only">Next</span>
              &rarr;
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
