import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

function safeParseUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('snappay_user');
    if (!raw || raw === 'undefined') return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function getInitialToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken') || null;
}

const initialState: AuthState = {
  user: safeParseUser(),
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
