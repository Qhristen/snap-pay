'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { incrementBalance } from '@/store/slices/walletSlice';
import { useDepositMutation } from '@/store/api/walletApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

const depositSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
});

type DepositValues = z.infer<typeof depositSchema>;

interface DepositFormProps {
  onSuccess?: () => void;
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const dispatch = useAppDispatch();
  const [deposit, { isLoading }] = useDepositMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepositValues>({
    resolver: zodResolver(depositSchema),
  });

  const onSubmit = async (data: DepositValues) => {
    try {
      await deposit({ amount: Number(data.amount) }).unwrap();
      dispatch(incrementBalance(Number(data.amount)));
      toast.success('Deposit successful!');
      reset();
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.data?.message || 'Deposit failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Amount (NGN)"
        placeholder="5000"
        error={errors.amount?.message}
        {...register('amount')}
      />
      <Button type="submit" className="w-full h-14 bg-primary text-lg font-bold text-background hover:bg-gold-glow" isLoading={isLoading}>
        Confirm Deposit
      </Button>
    </form>
  );
}
