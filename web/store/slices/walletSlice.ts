import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  balance: number;
  currency: string;
  lastUpdated: string | null;
}

const initialState: WalletState = {
  balance: 0,
  currency: 'NGN',
  lastUpdated: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setBalance(state, action: PayloadAction<number>) {
      state.balance = action.payload;
    },
    updateBalance(state, action: PayloadAction<{ balance: string | number; currency: string; timestamp: string }>) {
      state.balance = typeof action.payload.balance === 'string' ? parseFloat(action.payload.balance) : action.payload.balance;
      state.currency = action.payload.currency;
      state.lastUpdated = action.payload.timestamp;
    },
    incrementBalance(state, action: PayloadAction<number>) {
      state.balance += action.payload;
    },
    decrementBalance(state, action: PayloadAction<number>) {
      state.balance -= action.payload;
    },
  },
});

export const { setBalance, updateBalance, incrementBalance, decrementBalance } = walletSlice.actions;
export default walletSlice.reducer;

