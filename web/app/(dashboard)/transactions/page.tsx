'use client';

import { useState } from 'react';
import { useGetTransactionsQuery } from '@/store/api/transactionApi';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatCurrency, cn } from '@/lib/utils';
import { ArrowDownLeft, ArrowUpRight, Send, Search, Filter, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { TransactionTypeFilter } from '@/types';
import Link from 'next/link';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<TransactionTypeFilter>(TransactionTypeFilter.ALL);

  const { data, isLoading } = useGetTransactionsQuery({
    page,
    limit: 10,
    type: type === TransactionTypeFilter.ALL ? undefined : type,
  });

  const transactions = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;


  return (
    <div className="space-y-8">
      <div className='flex items-center justify-between'>
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-white/40">Keep track of all your financial activities.</p>
        </div>
        <Link href="/dashboard" className="h-10 w-10 flex items-center justify-center rounded-xl bg-surface border border-white/5 text-muted-foreground hover:text-white transition-colors">
          <LayoutDashboard size={18} />
        </Link>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end">

        <div className="flex flex-row-reverse gap-2">
          {Object.values(TransactionTypeFilter).map((t) => (
            <Button
              key={t}
              variant={type === t ? 'primary' : 'outline'}
              size="sm"
              onClick={() => { setType(t); setPage(1); }}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>
      </div>

      <Card className="premium-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No transactions found</div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx: any, index: number) => {
                const type = tx.type.toLowerCase();
                const isCredit = type === 'deposit' || type === 'transfer_received' || type === 'credit';
                const amount = typeof tx.amount === 'string' ? parseFloat(tx.amount) : tx.amount;

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-6 transition-hover hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full",
                        isCredit ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {(type === 'deposit' || type === 'transfer_received') && <ArrowDownLeft className="h-6 w-6" />}
                        {(type === 'withdrawal' || type === 'transfer_sent') && <ArrowUpRight className="h-6 w-6" />}
                        {type === 'transfer' && <Send className="h-6 w-6" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white/40 text-sm md:text-md">{tx.description || tx.type.replace('_', ' ')}</p>
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase">
                            {tx.status?.toLowerCase() || 'completed'}
                          </span>
                        </div>
                        <p className="text-xs md:text-sm text-white/40">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-md md:text-lg font-bold",
                        isCredit ? "text-green-500" : "text-red-500"
                      )}>
                        {isCredit ? '+' : '-'}{formatCurrency(amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">Ref: {tx.id.slice(0, 8)}</p>
                    </div>
                  </motion.div>
                );
              })}

            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center px-4 text-sm font-medium">
            Page {page} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
