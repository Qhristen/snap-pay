import { api } from "./index";

export interface Bank {
  code: string;
  name: string;
}

export interface VerifyAccountRequest {
  accountNumber: string;
  bankCode: string;
}

export interface VerifyAccountResponse {
  accountName: string;
  accountNumber: string;
}

export interface InitializeFundingRequest {
  amount: number;
  callbackUrl: string;
}

export interface InitializeFundingResponse {
  success: boolean;
  data: {
    authorizationUrl: string;
    accessCode: string;
    reference: string;
  };
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface LinkBankAccountRequest {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface WithdrawRequest {
  bankAccountId: string;
  amount: number;
}

export interface VerifyFundingResponse {
  success: boolean;
  message: string;
  balance?: number;
}

export interface WithdrawResponse {
  success: boolean;
  transactionId: string;
  amount: number;
  remainingBalance: number;
}

export type ApiResponse<T> = {
  data: T;
  message?: string;
  statusCode?: number;
  success?: boolean;
};

// Unwrap NestJS { data: {...}, message, statusCode } wrapper safely
function unwrap<T>(response: unknown): T {
  if (response && typeof response === 'object' && !Array.isArray(response) && 'data' in response) {
    return (response as ApiResponse<T>).data;
  }
  return response as T;
}

export const paymentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getBanks: builder.query<{ data: {data: Bank[]}  }, void>({
      query: () => "/api/v1/payment/banks",
      // transformResponse: (response: { data: Bank[] }) => response.data,
      providesTags: ["Banks"],
    }),
    verifyAccount: builder.mutation<VerifyAccountResponse, VerifyAccountRequest>({
      query: (data) => ({
        url: "/api/v1/payment/verify-account",
        method: "POST",
        data,
      }),
      transformResponse: unwrap<VerifyAccountResponse>,
    }),
    initializeFunding: builder.mutation<InitializeFundingResponse, InitializeFundingRequest>({
      query: (data) => ({
        url: "/api/v1/payment/fund/initialize",
        method: "POST",
        data,
      }),
      transformResponse: unwrap<InitializeFundingResponse>,
    }),
    verifyFunding: builder.mutation<VerifyFundingResponse, { reference: string }>({
      query: (data) => ({
        url: "/api/v1/payment/fund/verify",
        method: "POST",
        data,
      }),
      transformResponse: unwrap<VerifyFundingResponse>,
      invalidatesTags: ["Wallet", "Transactions"],
    }),
    linkBankAccount: builder.mutation<BankAccount, LinkBankAccountRequest>({
      query: (data) => ({
        url: "/api/v1/payment/bank-account",
        method: "POST",
        data,
      }),
      transformResponse: unwrap<BankAccount>,
      invalidatesTags: ["Bank Accounts"],
    }),
    getBankAccounts: builder.query<BankAccount[], void>({
      query: () => "/api/v1/payment/bank-accounts",
      transformResponse: (response: unknown): BankAccount[] => {
        const unwrapped = unwrap<BankAccount[]>(response);
        return Array.isArray(unwrapped) ? unwrapped : [];
      },
      providesTags: ["Bank Accounts"],
    }),
    withdraw: builder.mutation<WithdrawResponse, WithdrawRequest>({
      query: (data) => ({
        url: "/api/v1/payment/withdraw",
        method: "POST",
        data,
      }),
      transformResponse: unwrap<WithdrawResponse>,
      invalidatesTags: ["Wallet", "Transactions"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetBanksQuery,
  useVerifyAccountMutation,
  useInitializeFundingMutation,
  useVerifyFundingMutation,
  useLinkBankAccountMutation,
  useGetBankAccountsQuery,
  useWithdrawMutation,
} = paymentApi;
