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
      socket.on('balance:updated', (payload: { balance: string; currency: string }) => {
        console.log('Balance update received:', payload);
        dispatch(setBalance(parseFloat(payload.balance)));
        // Refresh transactions and wallet data
        dispatch({ type: 'api/invalidateTags', payload: ['Wallet', 'Transactions'] });
      });

      socket.on('transfer:received', ({ amount, from }: { amount: string; from: string }) => {
        console.log('Transfer received:', { amount, from });
        toast.success(`You received ${formatCurrency(parseFloat(amount))} from ${from}`);
        // Refresh transactions
        dispatch({ type: 'api/invalidateTags', payload: ['Transactions'] });
      });

      socket.on('notification:received', (notification: any) => {
        console.log('Notification received:', notification);
        toast.info(notification.title, {
          description: notification.message,
        });
        // Invalidate notifications to refresh count and list
        dispatch({
          type: 'api/invalidateTags',
          payload: ['Notifications'],
        });
      });
    }

    return () => {
      // Don't disconnect on every re-render, only when token changes or unmount
    };
  }, [token, dispatch]);

  return socketService;
}
