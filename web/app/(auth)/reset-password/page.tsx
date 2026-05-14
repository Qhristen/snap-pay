'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useResetPasswordMutation } from '@/store/api/authApi';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ChevronLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'Reset code must be 6 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one number or special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: emailFromQuery,
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    try {
      await resetPassword({
        email: data.email,
        otp: data.otp,
        password: data.password,
      }).unwrap();
      
      toast.success('Password reset successful! You can now log in.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to reset password');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-sora text-4xl font-bold text-foreground tracking-tight">Set New Password</h1>
        <p className="mt-4 text-foreground/40 font-medium">Please enter the 6-digit code we sent and your new password.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          placeholder="name@example.com"
          error={errors.email?.message}
          className="h-12 bg-foreground/5 border-border"
          {...register('email')}
        />

        <Input
          label="Reset Code"
          placeholder="123456"
          maxLength={6}
          error={errors.otp?.message}
          className="h-12 bg-foreground/5 border-border font-mono tracking-[0.5em] text-center"
          {...register('otp')}
        />

        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          className="h-12 bg-foreground/5 border-border"
          {...register('password')}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          className="h-12 bg-foreground/5 border-border"
          {...register('confirmPassword')}
        />

        <div className="pt-6">
          <Button 
            type="submit" 
            className="h-16 w-full bg-primary text-xl font-bold text-background hover:bg-gold-glow transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
            isLoading={isLoading}
          >
            Reset Password
          </Button>
        </div>
      </form>

      <Link href="/forgot-password" className="mt-12 flex items-center justify-center gap-2 text-xs font-bold text-foreground/20 hover:text-foreground/60 transition-colors uppercase tracking-[0.2em]">
         <ChevronLeft size={14} /> Back to Request
      </Link>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen bg-background overflow-hidden">
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto">
        <div className="absolute top-12 left-12">
            <Link href="/" className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-primary fill-primary" />
                <span className="font-sora text-2xl font-extrabold text-foreground">SnapPay</span>
            </Link>
        </div>

        <Suspense fallback={<div className="text-foreground text-center">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
