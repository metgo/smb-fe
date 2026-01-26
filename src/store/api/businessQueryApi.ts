import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface BusinessStatsParams {
  startDate?: string;
  endDate?: string;
  dmoId?: string;
  authorityId?: string;
  businessId?: string;
  minPrice?: string;
  maxPrice?: string;
  status?: string;
}

interface BusinessListParams {
  page?: string;
  limit?: string;
  search?: string;
  businessType?: string;
  status?: string;
  isRegistration?: boolean;
  isFree?: boolean;
  authorityId?: boolean;
  dmoId?: boolean;
  sortOrder?: string;
  sortBy?: string;
  startDate?: string;
  endDate?: string;
}

export const businessQueryApi = createApi({
  reducerPath: "businessQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Business"],
  endpoints: (builder) => ({
    getAllbusinesses: builder.query<any, BusinessListParams>({
      query: (params) => ({
        url: endpoints.businesses,
        method: "GET",
        params,
      }),
    }),

    getBusinessStats: builder.query<any, BusinessStatsParams>({
      query: (params) => ({
        url: endpoints.businessStats,
        method: "GET",
        params,
      }),
    }),

    getbusinessById: builder.query<any, { businessId: string | null }>({
      query: ({ businessId }) => ({
        url: `${endpoints.business}/${businessId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAllbusinessesQuery,
  useGetBusinessStatsQuery,
  useGetbusinessByIdQuery,
} = businessQueryApi;
