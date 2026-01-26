import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

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
  }),
});

export const { useGetUserInfoQuery } = userQueryApi;
