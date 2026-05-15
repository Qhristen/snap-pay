import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../base-query";

/**
 * Base API service definition.
 * Endpoints are injected from separate files to maintain modularity and prevent circular dependencies.
 */
export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Wallet", "Transactions", "Banks", "Bank Accounts", "Notifications", "AuditLogs"],
  endpoints: () => ({}),
});

