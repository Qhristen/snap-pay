'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { decrementBalance } from '@/store/slices/walletSlice';
import { useWithdrawMutation } from '@/store/api/walletApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const withdrawSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
});

type WithdrawValues = z.infer<typeof withdrawSchema>;

interface WithdrawFormProps {
  onSuccess?: () => void;
}

export function WithdrawForm({ onSuccess }: WithdrawFormProps) {
  const dispatch = useAppDispatch();
  const balance = useAppSelector((state) => state.wallet.balance);
  const [withdraw, { isLoading }] = useWithdrawMutation();

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

  const onSubmit = async (data: WithdrawValues) => {
    if (Number(data.amount) > balance) {
      toast.error('Insufficient funds');
      return;
    }

    try {
      await withdraw({ amount: Number(data.amount) }).unwrap();
      dispatch(decrementBalance(Number(data.amount)));
      toast.success('Withdrawal successful!');
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.data?.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/5 border border-white/5 p-4">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Available Balance</p>
        <p className="text-2xl font-mono font-bold text-white mt-1">{formatCurrency(balance)}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Amount (NGN)"
          placeholder="5000"
          error={errors.amount?.message}
          {...register('amount')}
        />
        {Number(amount) > balance && (
          <p className="text-xs font-medium text-destructive">Insufficient balance</p>
        )}
        <Button type="submit" className="w-full h-14 bg-primary text-lg font-bold text-background hover:bg-gold-glow" isLoading={isLoading}>
          Confirm Withdrawal
        </Button>
      </form>
    </div>
  );
}
