import { api } from "./index";
import Cookies from "js-cookie";
import { setCredentials, logout as logoutAction } from "../slices/authSlice";

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    fullName: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface RegisterRequest {
  email: string;
  fullName: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email?: string;
  username?: string;
  password: string;
}

// Unwrap the NestJS { data: {...}, message, statusCode } wrapper
function unwrapAuth(response: any): AuthResponse {
  const payload = response?.data ?? response;
  return {
    user: payload.user,
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  };
}

/**
 * Persist auth credentials to localStorage and Cookies.
 * Called from onQueryStarted after successful login/register.
 */
function persistAuth(data: AuthResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("snappay_user", JSON.stringify(data.user));
  Cookies.set("snappay_token", data.accessToken, { expires: 7 });
}

/**
 * Clear all persisted auth data from localStorage and Cookies.
 */
function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("snappay_user");
  Cookies.remove("snappay_token");
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (data) => ({
        url: "/api/v1/auth/register",
        method: "POST",
        data,
      }),
      transformResponse: unwrapAuth,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          persistAuth(data);
          dispatch(setCredentials({ user: data.user, token: data.accessToken }));
        } catch (err) {
          console.error("Registration failed:", err);
        }
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (data) => ({
        url: "/api/v1/auth/login",
        method: "POST",
        data,
      }),
      transformResponse: unwrapAuth,
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          persistAuth(data);
          dispatch(setCredentials({ user: data.user, token: data.accessToken }));
        } catch (err) {
          console.error("Login failed:", err);
        }
      },
    }),
    refreshToken: builder.mutation<{ accessToken: string; refreshToken: string }, void>({
      query: () => ({
        url: "/api/v1/auth/refresh",
        method: "POST",
        data: { refreshToken: typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null },
      }),
      transformResponse: (response: any) => {
        const payload = response?.data ?? response;
        return { accessToken: payload.accessToken, refreshToken: payload.refreshToken };
      },
      async onQueryStarted(_arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (typeof window !== "undefined") {
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
            Cookies.set("snappay_token", data.accessToken, { expires: 7 });
          }
        } catch (err) {
          console.error("Token refresh failed:", err);
          clearAuth();
        }
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/v1/auth/logout",
        method: "POST",
        data: { refreshToken: typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null },
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err) {
          console.error("Logout error:", err);
        } finally {
          clearAuth();
          dispatch(logoutAction());
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
} = authApi;
