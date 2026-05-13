'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLoginMutation } from '@/store/api/authApi';
import { toast } from 'sonner';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, ChevronLeft } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      await login({
        email: data.email,
        password: data.password,
      }).unwrap();
      
      toast.success('Welcome back to SnapPay!');
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.data?.message || 'Login failed');
    }
  };


  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 bg-primary/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md"
      >
        <div className="mb-10 flex flex-col items-center">
          <Link href="/" className="group mb-8 flex items-center gap-2 transition-transform hover:scale-105">
            <Zap className="h-10 w-10 text-primary fill-primary" />
            <span className="font-sora text-3xl font-extrabold tracking-tighter text-white">SnapPay</span>
          </Link>
          <h1 className="font-sora text-2xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Secure access to your digital wallet</p>
        </div>

        <div className="border border-white/5 bg-surface p-8 shadow-2xl md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Input
                label="Email Address"
                placeholder="name@example.com"
                error={errors.email?.message}
                className="bg-background/50 border-white/5 h-12"
                {...register('email')}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                <Link href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-tighter">Forgot Password?</Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                className="bg-background/50 border-white/5 h-12"
                {...register('password')}
              />
            </div>
            <Button type="submit" className="h-14 w-full bg-primary text-lg font-bold text-background hover:bg-gold-glow" isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="font-bold text-primary hover:text-gold-glow transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>

        <Link href="/" className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-white transition-colors uppercase tracking-widest">
           <ChevronLeft size={16} /> Back to Home
        </Link>
      </motion.div>
    </div>
  );
}

