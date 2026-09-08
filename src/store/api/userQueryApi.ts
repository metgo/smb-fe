import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";
import { UserRole } from "@/enums/user.types";

export interface GetUsersParams {
  page: number;
  limit: number;
  role: UserRole;
  dmoId?: string;
  authorityId?: string;
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

    getUserDetailsByEmail: builder.query<IUserDetailsRes, string>({
      query: (email) => ({
        url: `${endpoints.users}/${email}`,
        method: "GET",
      }),
      providesTags: ["user"],
    }),

    getUsers: builder.query<IUsersRes, GetUsersParams>({
      query: ({ page, limit, role, search, dmoId, authorityId }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          role,
        });
        if (search) params.set("search", search);
        if (role !== UserRole.SUPERADMIN) {
          if (dmoId) params.set("dmoId", dmoId);
          if (authorityId && role !== UserRole.DMO) {
            params.set("authorityId", authorityId);
          }
        }
        return {
          url: `${endpoints.users}?${params.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["user"],
    }),
  }),
});

export const {
  useGetUserInfoQuery,
  useLazyGetUserInfoQuery,
  useGetUsersQuery,
  useGetUserDetailsByEmailQuery,
} = userQueryApi;
