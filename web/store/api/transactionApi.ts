import { api } from "./index";

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'transfer_sent' | 'transfer_received' | 'deposit' | 'withdrawal';
export type TransactionStatus = 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'success' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  reference: string;
  amount: number | string;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  createdAt: string;
  metadata?: any;
}


export interface GetTransactionsParams {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
}


export interface PaginatedTransactions {
  data: Transaction[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const transactionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getTransactions: builder.query<PaginatedTransactions, GetTransactionsParams | void>({
      query: (params) => ({
        url: "/api/v1/transactions",
        params: params || {},
      }),
      transformResponse: (response: any): PaginatedTransactions => {
        // Handle wrapped { data: { data: [], meta: {} } } and flat { data: [], meta: {} }
        const payload = response?.data ?? response;
        return {
          data: Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [],
          meta: payload?.meta ?? {
            totalItems: 0,
            itemCount: 0,
            itemsPerPage: 10,
            totalPages: 1,
            currentPage: 1,
          },
        };
      },
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({ type: "Transactions" as const, id })),
              { type: "Transactions", id: "LIST" },
            ]
          : [{ type: "Transactions", id: "LIST" }],
    }),

  }),
  overrideExisting: true,
});


export const { useGetTransactionsQuery } = transactionApi;
