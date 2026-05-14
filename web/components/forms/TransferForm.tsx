'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppSelector } from '@/hooks/useAppSelector';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { decrementBalance } from '@/store/slices/walletSlice';
import { useTransferMutation } from '@/store/api/walletApi';
import { useLazyGetUserByEmailQuery } from '@/store/api/userApi';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, ArrowRight } from 'lucide-react';

const transferSchema = z.object({
  recipientEmail: z.string().email('Invalid email address'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  note: z.string().optional(),
});

type TransferValues = z.infer<typeof transferSchema>;

interface TransferFormProps {
  onSuccess?: () => void;
}

export function TransferForm({ onSuccess }: TransferFormProps) {
  const dispatch = useAppDispatch();
  const balance = useAppSelector((state) => state.wallet.balance);

  const [step, setStep] = useState(1);
  const [recipientName, setRecipientName] = useState<string | null>(null);

  const [getUserByEmail, { isFetching: isSearching }] = useLazyGetUserByEmailQuery();
  const [transfer, { isLoading }] = useTransferMutation();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
    trigger,
  } = useForm<TransferValues>({
    resolver: zodResolver(transferSchema),
  });

  const recipientEmail = watch('recipientEmail');
  const amount = watch('amount');

  const checkRecipient = async () => {
    const isValid = await trigger('recipientEmail');
    if (!isValid) return;

    try {
      const result = await getUserByEmail(recipientEmail).unwrap();
      console.log({result}, "result");
      if (result.email) {
        setRecipientName(result.fullName);
        setStep(2);
      } else {
        toast.error('Recipient not found');
      }
    } catch (error: any) {
      toast.error(error.data?.message || 'Error finding recipient');
    }
  };

  const onSubmit = async (data: TransferValues) => {
    if (Number(data.amount) > balance) {
      toast.error('Insufficient funds');
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    try {
      await transfer({
        email: data.recipientEmail,
        amount: Number(data.amount),
      }).unwrap();
      dispatch(decrementBalance(Number(data.amount)));
      toast.success('Transfer successful!');
      reset();
      setStep(1);
      setRecipientName(null);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.data?.message || 'Transfer failed');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Step indicator */}
      <div className="flex gap-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 transition-colors ${s <= step ? 'bg-primary' : 'bg-white/5'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <Input
              label="Recipient Email"
              placeholder="friend@example.com"
              error={errors.recipientEmail?.message}
              {...register('recipientEmail')}
            />
            <Button
              type="button"
              className="w-full h-14 bg-primary text-lg font-bold text-background hover:bg-gold-glow"
              onClick={checkRecipient}
              isLoading={isSearching}
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 bg-primary/10 border border-primary/20 p-4">
              <div className="h-10 w-10 bg-primary flex items-center justify-center text-background">
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{recipientName}</p>
                <p className="text-xs text-muted-foreground truncate">{recipientEmail}</p>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-primary hover:text-gold-glow transition-colors"
                onClick={() => setStep(1)}
              >
                Change
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Amount</label>
                <span className="text-xs text-muted-foreground">
                  Balance: {formatCurrency(balance)}
                </span>
              </div>
              <Input
                placeholder="0.00"
                error={errors.amount?.message}
                {...register('amount')}
              />
              {Number(amount) > balance && (
                <p className="text-xs font-medium text-destructive">Insufficient balance</p>
              )}
            </div>

            <Input
              label="Note (Optional)"
              placeholder="What is this for?"
              {...register('note')}
            />

            <Button type="submit" className="w-full h-14 bg-primary text-lg font-bold text-background hover:bg-gold-glow">
              Review Transfer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 text-center"
          >
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">You are sending</p>
              <h3 className="text-3xl font-mono font-bold text-white">{formatCurrency(Number(amount))}</h3>
              <p className="text-muted-foreground text-sm">to</p>
              <div className="flex items-center justify-center gap-2 font-bold text-white">
                <UserIcon className="h-5 w-5 text-primary" />
                {recipientName}
              </div>
            </div>

            <div className=" border border-white/5 bg-white/5 p-4 text-left text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction Fee</span>
                <span className="font-bold text-success">Free</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-2 font-bold text-white">
                <span>Total to debit</span>
                <span>{formatCurrency(Number(amount))}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-14 "
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                type="button"
                className="flex-1 h-14  bg-primary text-lg font-bold text-background hover:bg-gold-glow"
                isLoading={isLoading}
                onClick={handleSubmit(onSubmit)}
              >
                Confirm & Send
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
