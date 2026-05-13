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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] translate-x-1/2 translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />

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
          <h1 className="font-sora text-2xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-sm font-medium text-muted-foreground">Start your digital banking journey</p>
        </div>

        <div className="rounded-[2.5rem] border border-white/5 bg-surface p-8 shadow-2xl md:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              error={errors.fullName?.message}
              className="bg-background/50 border-white/5 rounded-2xl h-12"
              {...register('fullName')}
            />
            <Input
              label="Username"
              placeholder="johndoe"
              error={errors.username?.message}
              className="bg-background/50 border-white/5 rounded-2xl h-12"
              {...register('username')}
            />
            <Input
              label="Email Address"
              placeholder="name@example.com"
              error={errors.email?.message}
              className="bg-background/50 border-white/5 rounded-2xl h-12"
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              className="bg-background/50 border-white/5 rounded-2xl h-12"
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              className="bg-background/50 border-white/5 rounded-2xl h-12"
              {...register('confirmPassword')}
            />
            <div className="pt-2">
              <Button type="submit" className="h-14 w-full rounded-2xl bg-primary text-lg font-bold text-background hover:bg-gold-glow" isLoading={isLoading}>
                Register
              </Button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-primary hover:text-gold-glow transition-colors">
                Sign In
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

