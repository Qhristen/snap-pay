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
    <div className="flex min-h-screen bg-background overflow-hidden">
      {/* Left Side: Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#0a0a0a] overflow-hidden flex-col justify-between p-36">
        {/* Background Mesh/Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#D4AF3715_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,#7C3AED10_0%,transparent_50%)]" />
        
        <Link href="/" className="relative z-10 flex items-center gap-2 group max-w-fit">
          <Zap className="h-10 w-10 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="font-sora text-3xl font-extrabold tracking-tighter text-white">SnapPay</span>
        </Link>

        <div className="relative z-10 space-y-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-sora font-extrabold text-white leading-tight max-w-xl"
          >
            The Future of <span className="text-primary italic">Digital Banking</span> is Here.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/40 max-w-md"
          >
            Experience seamless transactions, instant notifications, and premium security designed for the modern world.
          </motion.p>
        </div>

  
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col justify-center p-6 md:p-12 lg:p-24 relative overflow-y-auto">
        <div className="lg:hidden absolute top-12 left-12">
            <Link href="/" className="flex items-center gap-2">
                <Zap className="h-8 w-8 text-primary fill-primary" />
                <span className="font-sora text-2xl font-extrabold text-white">SnapPay</span>
            </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <h1 className="font-sora text-4xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="mt-4 text-white/40 font-medium">Please enter your details to access your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <Input
                label="Email Address"
                placeholder="name@example.com"
                error={errors.email?.message}
                className="h-14 bg-white/5 border-white/10 focus:border-primary/50 transition-all text-lg"
                {...register('email')}
              />
              
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                labelRight={
                  <Link href="/forgot-password" className="font-bold text-primary hover:text-gold-glow transition-colors">
                    Forgot Password?
                  </Link>
                }
                className="h-14 bg-white/5 border-white/10 focus:border-primary/50 transition-all text-lg"
                {...register('password')}
              />
            </div>

            <Button 
              type="submit" 
              className="h-16 w-full bg-primary text-xl font-bold text-background hover:bg-gold-glow transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-white/40 font-medium">
              New to SnapPay?{' '}
              <Link href="/register" className="text-white font-bold hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">
                Create an account
              </Link>
            </p>
          </div>

          <Link href="/" className="mt-12 flex items-center justify-center gap-2 text-xs font-bold text-white/20 hover:text-white/60 transition-colors uppercase tracking-[0.2em]">
             <ChevronLeft size={14} /> Return to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

