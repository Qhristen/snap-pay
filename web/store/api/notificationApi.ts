import { api } from "./index";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'TRANSACTION' | 'SECURITY' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => "/api/v1/notifications",
      transformResponse: (response: any) => response?.data ?? response,
      providesTags: ["Notifications"],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => "/api/v1/notifications/unread-count",
      transformResponse: (response: any) => ({ count: response?.data ?? response }),
      providesTags: ["Notifications"],
    }),
    markAsRead: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/v1/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllAsRead: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/api/v1/notifications/read-all",
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationApi;
