'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetBankAccountsQuery, useWithdrawMutation } from '@/store/api/paymentApi';
import { useWalletWithdrawMutation } from '@/store/api/walletApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { formatCurrency, cn } from '@/lib/utils';
import { AddBankAccountForm } from './AddBankAccountForm';
import { Landmark, Plus, CheckCircle2 } from 'lucide-react';

const withdrawSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 100, {
    message: 'Minimum withdrawal is ₦100',
  }),
  accountNumber: z.string().min(10, 'Account number must be at least 10 digits')
});

type WithdrawValues = z.infer<typeof withdrawSchema>;

interface WithdrawFormProps {
  onSuccess?: () => void;
}

export function WithdrawForm({ onSuccess }: WithdrawFormProps) {
  const balance = useAppSelector((state) => state.wallet.balance);
  const { data: bankAccounts, isLoading: isLoadingBanks } = useGetBankAccountsQuery();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();
  const [walletWithdraw, { isLoading: isWalletWithdrawing }] = useWalletWithdrawMutation();
  
  const [activeTab, setActiveTab] = useState<'internal' | 'paystack'>('internal');
  const [showAddBank, setShowAddBank] = useState(false);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<WithdrawValues>({
    resolver: zodResolver(withdrawSchema),
  });

  const amount = watch('amount');

  // Automatically select first bank account if available
  if (!selectedBankAccountId && bankAccounts && bankAccounts.length > 0) {
    setSelectedBankAccountId(bankAccounts[0].id);
  }

  const onSubmit = async (data: WithdrawValues) => {
    if (Number(data.amount) > balance) {
      toast.error('Insufficient funds');
      return;
    }

    if (activeTab === 'paystack' && !selectedBankAccountId) {
      toast.error('Please select a bank account');
      return;
    }

    try {
      if (activeTab === 'paystack') {
        await withdraw({ 
          amount: Number(data.amount),
          bankAccountId: selectedBankAccountId!
        }).unwrap();
        toast.success('Paystack withdrawal initiated successfully!');
      } else {
        await walletWithdraw({
          amount: Number(data.amount)
        }).unwrap();
        toast.success('Withdrawal via SnapPay initiated successfully!');
      }
      
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.data?.message || 'Withdrawal failed');
    }
  };

  const showBankSection = activeTab === 'paystack';
  const requiresBankSetup = showBankSection && (showAddBank || (bankAccounts && bankAccounts.length === 0 && !isLoadingBanks));

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-surface border border-border">
        <button
          type="button"
          onClick={() => setActiveTab('internal')}
          className={cn(
            "flex-1 py-2 text-sm font-bold transition-colors cursor-pointer",
            activeTab === 'internal' ? "bg-primary text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Via SnapPay
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('paystack')}
          className={cn(
            "flex-1 py-2 text-sm font-bold transition-colors cursor-pointer",
            activeTab === 'paystack' ? "bg-primary text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Paystack
        </button>
      </div>

      <div className="bg-foreground/5 border border-border p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Available Balance</p>
        <p className="text-2xl font-mono font-bold text-foreground mt-1">{formatCurrency(balance)}</p>
      </div>

      {requiresBankSetup ? (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-foreground mb-1">Add Bank Account</h3>
            <p className="text-sm text-muted-foreground">Link your Nigerian bank account to withdraw funds.</p>
          </div>
          <AddBankAccountForm 
            onSuccess={() => setShowAddBank(false)} 
            onCancel={bankAccounts && bankAccounts.length > 0 ? () => setShowAddBank(false) : undefined}
          />
        </div>
      ) : (
        <>
          {showBankSection && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Select Bank Account</label>
                <button 
                  type="button" 
                  onClick={() => setShowAddBank(true)}
                  className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3 h-3" /> Add New
                </button>
              </div>

              <div className="space-y-2">
                {bankAccounts?.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => setSelectedBankAccountId(account.id)}
                    className={`p-4 border cursor-pointer transition-all flex items-center justify-between ${
                      selectedBankAccountId === account.id
                        ? 'bg-primary/5 border-primary'
                        : 'bg-foreground/5 border-border hover:border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${selectedBankAccountId === account.id ? 'bg-primary/20 text-primary' : 'bg-foreground/10 text-muted-foreground'}`}>
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{account.bankName}</p>
                        <p className="text-xs font-mono text-muted-foreground">{account.accountNumber} • {account.accountName}</p>
                      </div>
                    </div>
                    {selectedBankAccountId === account.id && (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Amount to Withdraw (NGN)"
              placeholder="5000"
              error={errors.amount?.message}
              {...register('amount')}
            />
            {Number(amount) > balance && (
              <p className="text-xs font-medium text-destructive">Insufficient balance</p>
            )}

             <Input
              label="Account Number"
              placeholder="0000000000"
              error={errors.accountNumber?.message}
              {...register('accountNumber')}
            />

            <Button 
              type="submit" 
              className="w-full h-14 bg-primary text-lg font-bold text-background hover:bg-gold-glow" 
              isLoading={isWithdrawing || isWalletWithdrawing}
              disabled={showBankSection && !selectedBankAccountId}
            >
              Confirm Withdrawal
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
