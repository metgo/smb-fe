import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";
import type { UserRole } from "@/enums/user.types";

export interface GetUsersParams {
  page: number;
  limit: number;
  role: UserRole;
  search?: string;
}

export const userQueryApi = createApi({
  reducerPath: "userQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["user"],
  endpoints: (builder) => ({
    getUserInfo: builder.query<UserInfoRes, void>({
      query: () => ({
        url: endpoints.userInfo,
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    getUsers: builder.query<IUsersRes, GetUsersParams>({
      query: ({ page, limit, role, search }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          role,
        });
        if (search) params.set("search", search);
        return {
          url: `${endpoints.users}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["user"],
    }),
  }),
});

export const { useGetUserInfoQuery, useGetUsersQuery } = userQueryApi;
