'use client';

import { motion } from 'framer-motion';
import { cn, formatCurrency } from '@/lib/utils';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Send, 
  Wallet,
  ArrowRightLeft
} from 'lucide-react';

interface TransactionCardProps {
  transaction: any;
  index: number;
}

export function TransactionCard({ transaction, index }: TransactionCardProps) {
  const type = transaction.type.toLowerCase();
  const status = transaction.status?.toLowerCase() || 'successful';
  
  // Logic to determine if it's a credit or debit
  const isCredit = 
    type === 'deposit' || 
    type === 'transfer_received' || 
    type === 'credit' ||
    type === 'transfer'; // old generic type assumed credit if not sent
    
  const amount = typeof transaction.amount === 'string' 
    ? parseFloat(transaction.amount) 
    : transaction.amount;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-6 transition-all hover:bg-white/[0.02] group"
    >
      <div className="flex items-center gap-5">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center border border-white/5 transition-transform group-hover:scale-110",
          isCredit ? "bg-success/10 text-success" : "bg-white/5 text-white"
        )}>
          {(type === 'deposit' || type === 'transfer_received') && <ArrowDownLeft className="h-6 w-6" />}
          {(type === 'withdrawal' || type === 'transfer_sent') && <ArrowUpRight className="h-6 w-6" />}
          {type === 'transfer' && <ArrowRightLeft className="h-6 w-6" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold tracking-tight text-white">
              {transaction.description || transaction.type.replace('_', ' ')}
            </p>
            {status !== 'successful' && (
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] font-bold uppercase text-white/40 border border-white/5">
                {status}
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
            {new Date(transaction.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn(
          "text-base font-mono font-bold tracking-tighter",
          isCredit ? "text-success" : "text-white"
        )}>
          {isCredit ? '+' : '-'}{formatCurrency(amount)}
        </p>
        <p className="text-[9px] text-white/20 font-mono mt-1">Ref: {transaction.id.slice(0, 8)}</p>
      </div>
    </motion.div>
  );
}
