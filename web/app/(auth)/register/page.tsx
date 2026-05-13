'use client';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRegisterMutation } from '@/store/api/authApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ChevronLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  username: z.string().min(3, 'Username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  email: z.string().email('Invalid email address'),
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

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    try {
      await registerUser({
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password,
      }).unwrap();

      toast.success('Account created successfully! Welcome to SnapPay.');
      window.location.href = '/dashboard';

    } catch (error: any) {
      toast.error(error.data?.message || 'Registration failed');
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
            Start Your <span className="text-primary italic">Financial Journey</span> with Us.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/40 max-w-md"
          >
            Join thousands of users who trust SnapPay for their daily transactions and wealth management.
          </motion.p>
        </div>


      </div>

      {/* Right Side: Register Form */}
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
          className="w-full max-w-md mx-auto pt-20 lg:pt-0"
        >
          <div className="mb-10">
            <h1 className="font-sora text-4xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="mt-4 text-white/40 font-medium">Join SnapPay today and experience the future of banking.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.fullName?.message}
              className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
              {...register('fullName')}
            />
            <Input
              label="Username"
              placeholder="johndoe"
              error={errors.username?.message}
              className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
              {...register('username')}
            />
            <Input
              label="Email Address"
              placeholder="name@example.com"
              error={errors.email?.message}
              className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
              {...register('email')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                {...register('password')}
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                className="h-12 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                {...register('confirmPassword')}
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="h-16 w-full bg-primary text-xl font-bold text-background hover:bg-gold-glow transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(212,175,55,0.2)]" 
                isLoading={isLoading}
              >
                Create Account
              </Button>
            </div>
          </form>

          <div className="mt-10 text-center">
            <p className="text-white/40 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-white font-bold hover:text-primary transition-colors underline decoration-primary/30 underline-offset-4">
                Sign in instead
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
