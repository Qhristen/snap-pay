import { api } from "./index";
import { User } from "@/types";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchUser: builder.query<User, { query: string }>({
      query: ({ query }) => `/api/v1/users/search?query=${query}`,
      transformResponse: (response: any): User => {
        // If it's an array (which the backend seems to return for search), return the first match
        const data = response?.data ?? response;
        return Array.isArray(data) ? data[0] : data;
      },
      providesTags: ["User"],
    }),
  }),
  overrideExisting: true,
});

export const { useLazySearchUserQuery } = userApi;
