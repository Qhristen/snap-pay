import { api } from "./index";
import { User } from "@/types";

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    searchUser: builder.query<User, { email: string }>({
      query: ({ email }) => `/api/v1/users/search?email=${email}`,
      transformResponse: (response: any): User => response?.data ?? response,
      providesTags: ["User"],
    }),
  }),
  overrideExisting: true,
});

export const { useLazySearchUserQuery } = userApi;
