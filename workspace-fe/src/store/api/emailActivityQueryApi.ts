import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const emailActivityQueryApi = createApi({
  reducerPath: "emailActivityQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EmailActivity"],
  endpoints: (builder) => ({
    getEmailActivity: builder.query<any, IEmailActivityListParams | void>({
      query: (params) => ({
        url: endpoints.emailActivity,
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: ["EmailActivity"],
    }),
    getEmailActivityLive: builder.query<
      any,
      IEmailActivityLiveSearchParams | void
    >({
      query: (params) => ({
        url: endpoints.emailActivityLiveSearch,
        method: "GET",
        params: params ?? undefined,
      }),
    }),
    getEmailActivityContent: builder.query<any, string>({
      query: (id) => ({
        url: `${endpoints.emailActivity}/${id}/content`,
        method: "GET",
      }),
    }),
    getEmailActivityLiveStats: builder.query<
      { datas: IEmailActivityLiveStatsResult },
      IEmailActivityLiveStatsParams | void
    >({
      query: (params) => ({
        url: endpoints.emailActivityLiveStats,
        method: "GET",
        params: params ?? undefined,
      }),
    }),
  }),
});

export const {
  useGetEmailActivityQuery,
  useGetEmailActivityLiveQuery,
  useGetEmailActivityContentQuery,
  useGetEmailActivityLiveStatsQuery,
} = emailActivityQueryApi;
