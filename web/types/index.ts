export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
}


export interface Wallet {
  id: string;
  balance: number;
  userId: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer_sent' | 'transfer_received';
  amount: number;
  description?: string;
  createdAt: string;
  sender?: User;
  recipient?: User;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}