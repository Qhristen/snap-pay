'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useInitializeFundingMutation } from '@/store/api/paymentApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { Wallet } from 'lucide-react';

const depositSchema = z.object({
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 500, {
    message: 'Minimum deposit is ₦500',
  }),
});

type DepositValues = z.infer<typeof depositSchema>;

interface DepositFormProps {
  onSuccess?: () => void;
}

export function DepositForm({ onSuccess }: DepositFormProps) {
  const [initializeFunding, { isLoading }] = useInitializeFundingMutation();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DepositValues>({
    resolver: zodResolver(depositSchema),
  });

  const onSubmit = async (data: DepositValues) => {
    try {
      const callbackUrl = `${window.location.origin}/deposit/verify`;

      const result = await initializeFunding({
        amount: Number(data.amount),
        callbackUrl
      }).unwrap();

      if (result.data?.authorizationUrl) {
        toast.success('Opening Payment gateway...');
        window.location.href = result.data.authorizationUrl;
        // window.open(result.data.authorizationUrl, '_blank');
        // onSuccess?.();
      } else {
        toast.error('Could not initialize payment. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to initialize funding');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Amount to Deposit (NGN)"
          placeholder="5000"
          error={errors.amount?.message}
          {...register('amount')}
        />

        <div className="grid grid-cols-3 gap-2">
          {[1000, 5000, 10000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setValue('amount', preset.toString())}
              className="py-2 bg-foreground/5 cursor-pointer border border-border text-xs font-bold text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all"
            >
              ₦{preset.toLocaleString()}
            </button>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full h-14 bg-primary text-lg font-bold text-background hover:bg-gold-glow"
          isLoading={isLoading}
        >
          Proceed to Payment
        </Button>
      </form>

      <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest font-bold">
        Secure Payment powered by Paystack
      </p>
    </div>
  );
}
