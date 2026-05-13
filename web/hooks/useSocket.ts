'use client';

import { useEffect } from 'react';
import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { socketService } from '@/lib/socket';
import { setBalance } from '@/store/slices/walletSlice';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

export function useSocket() {
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) {
      socketService.disconnect();
      return;
    }

    socketService.connect(token);
    const socket = socketService.getSocket();

    if (socket) {
      socket.on('balance_updated', (newBalance: number) => {
        console.log(newBalance, 'new balance');
        dispatch(setBalance(newBalance));
      });

      socket.on('transfer_received', ({ amount, from }: { amount: number; from: string }) => {
        console.log(amount, from, 'transfer received');
        toast.success(`You received ${formatCurrency(amount)} from ${from}`);
      });

      socket.on('transaction_created', () => {
        console.log('transaction created');
      });
    }

    return () => {
      // Don't disconnect on every re-render, only when token changes or unmount
    };
  }, [token, dispatch]);

  return socketService;
}
