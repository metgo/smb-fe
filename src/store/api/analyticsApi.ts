import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface GoogleAnalyticsParams {
  startDate: string;
  endDate: string;
  dmoId?: string;
  authorityId?: string;
  externalApiId?: string;
}

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Analytics"],
  endpoints: (builder) => ({
    getGoogleAnalyticsViews: builder.query<any, GoogleAnalyticsParams>({
      query: (params) => ({
        url: endpoints.googleAnalyticsViews,
        method: "GET",
        params,
      }),
      providesTags: ["Analytics"],
    }),

    getBusinessSummary: builder.query<IBusinessSummaryStatsRes, any>({
      query: (params) => ({
        url: endpoints.businessSummary,
        method: "GET",
        params,
      }),
      providesTags: ["Analytics"],
    }),

    getPoiSummary: builder.query<IPoiStatsRes, any>({
      query: (params) => ({
        url: endpoints.poiSummary,
        method: "GET",
        params,
      }),
      providesTags: ["Analytics"],
    }),
  }),
});

export const {
  useGetGoogleAnalyticsViewsQuery,
  useGetBusinessSummaryQuery,
  useGetPoiSummaryQuery,
} = analyticsApi;
