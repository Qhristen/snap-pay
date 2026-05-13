'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useGetBankAccountsQuery, useWithdrawMutation } from '@/store/api/paymentApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { AddBankAccountForm } from './AddBankAccountForm';
import { Landmark, Plus, CheckCircle2 } from 'lucide-react';

const withdrawSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 100, {
    message: 'Minimum withdrawal is ₦100',
  }),
});

type WithdrawValues = z.infer<typeof withdrawSchema>;

interface WithdrawFormProps {
  onSuccess?: () => void;
}

export function WithdrawForm({ onSuccess }: WithdrawFormProps) {
  const balance = useAppSelector((state) => state.wallet.balance);
  const { data: bankAccounts, isLoading: isLoadingBanks } = useGetBankAccountsQuery();
  const [withdraw, { isLoading: isWithdrawing }] = useWithdrawMutation();
  
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
    if (!selectedBankAccountId) {
      toast.error('Please select a bank account');
      return;
    }

    if (Number(data.amount) > balance) {
      toast.error('Insufficient funds');
      return;
    }

    try {
      await withdraw({ 
        amount: Number(data.amount),
        bankAccountId: selectedBankAccountId
      }).unwrap();
      
      toast.success('Withdrawal initiated successfully!');
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.data?.message || 'Withdrawal failed');
    }
  };

  if (showAddBank || (bankAccounts && bankAccounts.length === 0 && !isLoadingBanks)) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Add Bank Account</h3>
          <p className="text-sm text-muted-foreground">Link your Nigerian bank account to withdraw funds.</p>
        </div>
        <AddBankAccountForm 
          onSuccess={() => setShowAddBank(false)} 
          onCancel={bankAccounts && bankAccounts.length > 0 ? () => setShowAddBank(false) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/5 p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Available Balance</p>
        <p className="text-2xl font-mono font-bold text-white mt-1">{formatCurrency(balance)}</p>
      </div>

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
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${selectedBankAccountId === account.id ? 'bg-primary/20 text-primary' : 'bg-white/10 text-muted-foreground'}`}>
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{account.bankName}</p>
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
        <Button 
          type="submit" 
          className="w-full h-14 bg-primary text-lg font-bold text-background hover:bg-gold-glow" 
          isLoading={isWithdrawing}
          disabled={!selectedBankAccountId}
        >
          Confirm Withdrawal
        </Button>
      </form>
    </div>
  );
}
