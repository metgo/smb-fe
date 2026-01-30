import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface Params {
  startDate: string;
  endDate: string;
  dmoId?: string;
  authorityId?: string;
  externalApiId?: string;
  serviceType?: string;
  status?: string;
}

interface IFinancialSummaryParams {
  startDate: string;
  endDate: string;
  sortBy: string;
}
interface IVoucherStatsParams {
  createdEndDate: string;
  createdStartDate: string;
  sortBy: string;
}

export const itemStatsApi = createApi({
  reducerPath: "itemStatsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["ItemStatistics"],
  endpoints: (builder) => ({
    getBusinessStats: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.businessStats,
        method: "GET",
        params,
      }),
      providesTags: ["ItemStatistics"],
    }),

    getPOIStats: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.poiStats,
        method: "GET",
        params,
      }),
      providesTags: ["ItemStatistics"],
    }),

    getProductStats: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.productStats,
        method: "GET",
        params,
      }),
      providesTags: ["ItemStatistics"],
    }),

    getEventStats: builder.query<any, void>({
      query: () => ({
        url: endpoints.eventStats,
        method: "GET",
      }),
      providesTags: ["ItemStatistics"],
    }),

    getPurchaseReportsStats: builder.query<any, void>({
      query: () => ({
        url: endpoints.purchaseReportsStats,
        method: "GET",
      }),
      providesTags: ["ItemStatistics"],
    }),

    // Popular Contents
    getPopularBusinessStats: builder.query<any, void>({
      query: () => ({
        url: endpoints.popularBusinessStats,
        method: "GET",
      }),
      providesTags: ["ItemStatistics"],
    }),

    getPopularProductStats: builder.query<any, void>({
      query: () => ({
        url: endpoints.popularProductsStats,
        method: "GET",
      }),
      providesTags: ["ItemStatistics"],
    }),

    getPopularPoiStats: builder.query<any, void>({
      query: () => ({
        url: endpoints.popularPoiStats,
        method: "GET",
      }),
      providesTags: ["ItemStatistics"],
    }),

    // Financial Summary
    getVoucherStats: builder.query<any, IVoucherStatsParams>({
      query: (params) => ({
        url: endpoints.voucherStats,
        method: "GET",
        params,
      }),
    }),

    getOnlineOrderStats: builder.query<any, IFinancialSummaryParams>({
      query: (params) => ({
        url: endpoints.onlineOrderStats,
        method: "GET",
        params,
      }),
    }),

    getOfflineOrderStats: builder.query<any, IFinancialSummaryParams>({
      query: (params) => ({
        url: endpoints.offlineOrderStats,
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetBusinessStatsQuery,
  useGetPOIStatsQuery,
  useGetProductStatsQuery,
  useGetEventStatsQuery,
  useGetPurchaseReportsStatsQuery,
  useGetOfflineOrderStatsQuery,
  useGetOnlineOrderStatsQuery,
  useGetVoucherStatsQuery,

  useGetPopularBusinessStatsQuery,
  useGetPopularProductStatsQuery,
  useGetPopularPoiStatsQuery,
} = itemStatsApi;
