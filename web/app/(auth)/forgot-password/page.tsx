'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForgotPasswordMutation } from '@/store/api/authApi';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ChevronLeft, Mail } from 'lucide-react';
import { useState } from 'react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [isSent, setIsSent] = useState(false);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await forgotPassword(data).unwrap();
      setEmail(data.email);
      setIsSent(true);
      toast.success('Reset code sent to your email');
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to send reset code');
    }
  };

  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto">
        <div className="absolute top-12 left-12">
            <Link href="/" className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-primary fill-primary" />
                <span className="font-sora text-2xl font-extrabold text-foreground">SnapPay</span>
            </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          {!isSent ? (
            <>
              <div className="mb-10 text-center">
                <h1 className="font-sora text-4xl font-bold text-foreground tracking-tight">Forgot Password?</h1>
                <p className="mt-4 text-foreground/40 font-medium">Enter your email and we'll send you a code to reset your password.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email Address"
                  placeholder="name@example.com"
                  error={errors.email?.message}
                  className="h-14 bg-foreground/5 border-border focus:border-primary/50 transition-all text-lg"
                  {...register('email')}
                />

                <Button 
                  type="submit" 
                  className="h-16 w-full bg-primary text-xl font-bold text-background hover:bg-gold-glow transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                  isLoading={isLoading}
                >
                  Send Reset Code
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="font-sora text-3xl font-bold text-foreground">Check your email</h1>
                <p className="text-foreground/40 font-medium">
                  We've sent a 6-digit reset code to <span className="text-foreground">{email}</span>.
                </p>
              </div>
              <Link 
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="block h-16 w-full bg-primary flex items-center justify-center text-xl font-bold text-background hover:bg-gold-glow transition-all rounded-md"
              >
                Enter Reset Code
              </Link>
              <button 
                onClick={() => setIsSent(false)}
                className="text-foreground/40 hover:text-foreground font-bold transition-colors"
              >
                Didn't receive the email? Try again
              </button>
            </div>
          )}

          <Link href="/login" className="mt-12 flex items-center justify-center gap-2 text-xs font-bold text-foreground/20 hover:text-foreground/60 transition-colors uppercase tracking-[0.2em]">
             <ChevronLeft size={14} /> Back to Login
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
