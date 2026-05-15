import { api } from "./index";

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginatedAuditLogs {
  data: AuditLog[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

export const auditApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<PaginatedAuditLogs, GetAuditLogsParams | void>({
      query: (params) => ({
        url: "/api/v1/audit-logs",
        params: params || {},
      }),
      transformResponse: (response: any): PaginatedAuditLogs => {
        const payload = response?.data ?? response;
        return {
          data: payload?.data ?? (Array.isArray(payload) ? payload : []),
          meta: {
            totalItems: payload?.total ?? 0,
            itemCount: payload?.data?.length ?? 0,
            itemsPerPage: payload?.limit ?? 10,
            totalPages: payload?.totalPages ?? 1,
            currentPage: payload?.page ?? 1,
          },
        };
      },
      providesTags: (result) =>
        result?.data?.length
          ? [
              ...result.data.map(({ id }) => ({ type: "AuditLogs" as const, id })),
              { type: "AuditLogs", id: "LIST" },
            ]
          : [{ type: "AuditLogs", id: "LIST" }],
    }),
  }),
  overrideExisting: true,
});

export const { useGetAuditLogsQuery } = auditApi;
