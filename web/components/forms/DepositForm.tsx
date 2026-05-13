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
        toast.success('Redirecting to Paystack...');
        window.location.href = result.data.authorizationUrl;
      } else {
        toast.error('Could not initialize payment. Please try again.');
      }
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to initialize funding');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-white">Fund Your Wallet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
          Enter the amount you want to deposit. You will be redirected to Paystack to complete the payment.
        </p>
      </div>

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
              className="py-2 bg-white/5 border border-white/10 text-xs font-bold text-white hover:bg-primary/10 hover:border-primary/50 transition-all"
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
