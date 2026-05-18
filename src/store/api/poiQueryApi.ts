import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface PoiListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  authorityId?: string;
  dmoId?: string;
  sortOrder?: string;
  sortBy?: string;
  locale?: string;
  externalApiId?: string;
}

export const poiQueryApi = createApi({
  reducerPath: "poiQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["POI"],

  endpoints: (builder) => ({
    getAllPOI: builder.query<any, PoiListParams>({
      query: (params) => ({
        url: `${endpoints.pois}?sortBy=DESC`,
        method: "GET",
        params,
      }),
      providesTags: ["POI"],
    }),

    getPoiStats: builder.query<
      any,
      Omit<PoiListParams, "page" | "limit" | "locale">
    >({
      query: (params) => ({
        url: endpoints.poisStatDashboard,
        method: "GET",
        params,
      }),
    }),

    getPoiById: builder.query<any, { poiId: string | null }>({
      query: ({ poiId }) => ({
        url: `${endpoints.poi}/${poiId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),

    getIndividualPoiStats: builder.query<any, { poiId: string }>({
      query: ({ poiId }) => ({
        url: `${endpoints.poisStatDashboard}/${poiId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAllPOIQuery,
  useLazyGetAllPOIQuery,
  useGetPoiStatsQuery,
  useGetPoiByIdQuery,
  useGetIndividualPoiStatsQuery,
  useLazyGetIndividualPoiStatsQuery,
} = poiQueryApi;
