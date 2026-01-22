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

export const itemStatsApi = createApi({
  reducerPath: 'itemStatsApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['ItemStatistics'],
  endpoints: (builder) => ({
    getBusinessStats: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.businessStats,
        method: 'GET',
        params,
      }),
      providesTags: ['ItemStatistics'],
    }),
    getPOIStats: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.poiStats,
        method: 'GET',
        params,
      }),
      providesTags: ['ItemStatistics'],
    }),
    getProductStats: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.productStats,
        method: 'GET',
        params,
      }),
      providesTags: ['ItemStatistics'],
    }),
    getEventStats: builder.query<any, void>({
      query: () => ({
        url: endpoints.eventStats,
        method: 'GET',
      }),
      providesTags: ['ItemStatistics'],
    }),
    getPurchaseReportsStats: builder.query<any, void>({
      query: () => ({
        url: endpoints.purchaseReportsStats,
        method: 'GET',
      }),
      providesTags: ['ItemStatistics'],
    }),
  })
})

export const {
  useGetBusinessStatsQuery,
  useGetPOIStatsQuery,
  useGetProductStatsQuery,
  useGetEventStatsQuery,
  useGetPurchaseReportsStatsQuery,
} = itemStatsApi