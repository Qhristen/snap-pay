'use client';

import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { TransactionCard } from '@/components/wallet/TransactionCard';
import { cn } from '@/lib/utils';
import { useGetTransactionsQuery } from '@/store/api/transactionApi';
import { TransactionTypeFilter } from '@/types';
import { LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<TransactionTypeFilter>(TransactionTypeFilter.ALL);

  const { data, isLoading } = useGetTransactionsQuery({
    page,
    limit: 5,
    type: type === TransactionTypeFilter.ALL ? undefined : type,
  });

  const transactions = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;


  return (
    <div className="space-y-8">
      <div className='flex items-center justify-between'>
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-foreground/40">Keep track of all your financial activities.</p>
        </div>
        <Link href="/dashboard" className="h-10 w-10 flex items-center justify-center bg-surface border border-border text-foreground/40 hover:text-foreground transition-colors">
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
            <div className="flex flex-col items-center justify-center p-12">
             <div className="h-8 w-8 border-2 border-primary border-t-transparent animate-spin" />
            <div className="p-12 text-center text-foreground/40">Loading transactions...</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-foreground/40">No transactions found</div>
          ) : (
            <div className="divide-y divide-border">
              {transactions.map((tx: any, index: number) => (
                <TransactionCard key={tx.id} transaction={tx} index={index} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-6">
          <p className="text-xs text-foreground/40">
            Showing page <span className="text-foreground font-bold">{page}</span> of <span className="text-foreground font-bold">{totalPages}</span>
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
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <div key={p} className="flex items-center">
                  {i > 0 && arr[i-1] !== p - 1 && (
                    <span className="px-2 text-foreground/20 text-xs">...</span>
                  )}
                  <Button
                    variant={page === p ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                    className={cn(
                      "h-8 w-8 p-0 text-xs font-bold",
                      page === p ? "" : "border-border bg-foreground/5 hover:bg-foreground/10 text-foreground/40 hover:text-foreground"
                    )}
                  >
                    {p}
                  </Button>
                </div>
              ))
            }

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
