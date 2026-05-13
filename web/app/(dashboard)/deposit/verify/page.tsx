'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyFundingMutation } from '@/store/api/paymentApi';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function DepositVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [verifyFunding, { isLoading }] = useVerifyFundingMutation();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus('error');
        setMessage('No payment reference found.');
        return;
      }

      try {
        const result = await verifyFunding({ reference }).unwrap();
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Payment verified successfully!');
          toast.success('Wallet funded successfully');
        } else {
          setStatus('error');
          setMessage('Payment verification failed.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.data?.message || 'An error occurred while verifying payment.');
        toast.error('Verification failed');
      }
    };

    verify();
  }, [reference, verifyFunding]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-[#0A0A0A] border border-white/5 p-8 text-center space-y-6">
        {status === 'verifying' && (
          <>
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
              <Loader2 className="w-20 h-20 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verifying Payment</h1>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Ref: {reference}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Successful</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="pt-4">
              <Button 
                onClick={() => router.push('/dashboard')}
                className="w-full h-14 bg-primary text-background font-bold text-lg hover:bg-gold-glow flex items-center justify-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-destructive/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
            <p className="text-muted-foreground">{message}</p>
            <div className="pt-4 flex flex-col gap-3">
              <Button 
                onClick={() => router.push('/deposit')}
                className="w-full h-14 bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="text-muted-foreground hover:text-white"
              >
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
