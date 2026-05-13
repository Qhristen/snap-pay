import { BaseQueryFn, FetchArgs, FetchBaseQueryError, BaseQueryApi } from "@reduxjs/toolkit/query";
import { setToken, logout } from "./slices/authSlice";
import Cookies from "js-cookie";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";

// Mutex to prevent multiple simultaneous refresh attempts
let mutexPromise: Promise<void> | null = null;

/**
 * Clear all persisted auth data — used when refresh fails.
 */
function clearPersistedAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("snappay_user");
  Cookies.remove("snappay_token");
}

/**
 * Persist new tokens after a successful refresh.
 */
function persistTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", accessToken);
  Cookies.set("snappay_token", accessToken, { expires: 7 });
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
}

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  _api: BaseQueryApi,
  _extraOptions
) => {
  try {
    const fetchArgs = typeof args === 'string' ? { url: args, method: 'GET' } : args;
    const { url, method, body, params, headers } = fetchArgs;
    // Support both 'body' and 'data' for flexibility with Axios
    const data = (fetchArgs as any).data || body;
    
    const result = await axiosInstance({
      url,
      method,
      data,
      params,
      headers: (
        headers instanceof Headers ? Object.fromEntries(headers.entries()) :
        Array.isArray(headers) ? Object.fromEntries(headers) :
        headers
      ),
    });
    
    return { data: result.data };
  } catch (axiosError) {
    const err = axiosError as AxiosError;
    return {
      error: {
        status: err.response?.status as any,
        data: err.response?.data || err.message,
      },
    };
  }
};

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  // Wait if a refresh is already in progress
  if (mutexPromise) {
    await mutexPromise;
  }

  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // If another request already started refreshing, wait for it
    if (mutexPromise) {
      await mutexPromise;
      // Retry the original query
      return await baseQuery(args, api, extraOptions);
    }

    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refreshToken") : null;

    if (refreshToken) {
      // Create a new mutex promise
      let resolveMutex: () => void;
      mutexPromise = new Promise((resolve) => {
        resolveMutex = resolve;
      });

      try {
        // Attempt to get a new access token
        const refreshResult: any = await baseQuery(
          {
            url: "/api/v1/auth/refresh",
            method: "POST",
            data: { refreshToken },
          } as any,
          api,
          extraOptions
        );

        if (refreshResult.data) {
          const data = refreshResult.data.data || refreshResult.data;
          const accessToken = data.accessToken;
          const newRefreshToken = data.refreshToken;
          
          // Persist and update Redux state
          persistTokens(accessToken, newRefreshToken);
          api.dispatch(setToken(accessToken));

          // Retry the original query with the new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // Refresh failed — clear everything and logout
          clearPersistedAuth();
          api.dispatch(logout());
        }
      } finally {
        // Release the mutex
        const resolve = resolveMutex!;
        mutexPromise = null;
        resolve();
      }
    } else {
      // No refresh token available — clear everything and logout
      clearPersistedAuth();
      api.dispatch(logout());
    }
  }

  return result;
};