import { api } from "./index";

export interface WalletBalance {
  balance: number;
  currency: string;
}

export interface TransferRequest {
  email: string;
  amount: number;
}

export interface TransferResponse {
  transaction: {
    id: string;
    amount: number;
    createdAt: string;
  };
  senderBalance: number;
}

export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBalance: builder.query<WalletBalance, void>({
      query: () => "/api/v1/wallet/balance",
      transformResponse: (response: any): WalletBalance => {
        const payload = response?.data ?? response;
        return {
          balance: typeof payload?.balance === 'string' ? parseFloat(payload.balance) : (payload?.balance ?? 0),
          currency: payload?.currency ?? 'NGN',
        };
      },
      providesTags: ["Wallet"],
    }),

    transfer: builder.mutation<TransferResponse, TransferRequest>({
      query: (data) => ({
        url: "/api/v1/wallet/transfer",
        method: "POST",
        data,
      }),
      transformResponse: (response: any): TransferResponse => response?.data ?? response,
      invalidatesTags: ["Wallet", "Transactions"],
    }),

  }),
  overrideExisting: true,
});

export const { 
  useGetBalanceQuery, 
  useTransferMutation, 
} = walletApi;

