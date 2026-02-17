import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface BusinessStatsParams {
  totalBusinesses?: number;
  activeBusinesses?: number;
  totalProducts?: number;
  averageImpactScore?: number;
  pendingApproval?: number;
  averageCompletion?: number;
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
  hasProductFilter?: string;
  sortOrder?: string;
  sortBy?: string;
  startDate?: string;
  endDate?: string;
}

interface BusinessesForProductParams {
  locale: Language;
  limit: number;
  search?: string;
  status?: string;
  authorityId?: string;
  dmoId?: string;
  page?: number;
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
        url: endpoints.businessStatDashboard,
        method: "GET",
        params,
      }),
    }),

    getIndividualBusinessStats: builder.query<
      any,
      { businessId: string | null }
    >({
      query: ({ businessId }) => ({
        url: `${endpoints.businessStatDashboard}/${businessId}`,
        method: "GET",
      }),
    }),
    getbusinessById: builder.query<any, { businessId: string | null }>({
      query: ({ businessId }) => ({
        url: `${endpoints.business}/${businessId}`,
        method: "GET",
      }),
    }),
    getBusinessDeliveryInfoById: builder.query<
      any,
      { businessId: string | null }
    >({
      query: ({ businessId }) => ({
        url: `${endpoints.business}/${businessId}`,
        method: "GET",
        params: { showOnlyDeliveryInfo: true },
      }),
    }),

    getbusinessBySlug: builder.query<any, { slug: string | null }>({
      query: ({ slug }) => ({
        url: `${endpoints.business}/${slug}`,
        method: "GET",
      }),
    }),

    getBusinessForProduct: builder.query<any, BusinessesForProductParams>({
      query: (params) => ({
        url: endpoints.searchBusiness,
        method: "GET",
        params,
      }),
    }),
  }),
});

export const {
  useGetAllbusinessesQuery,
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
  useGetBusinessStatsQuery,
  useLazyGetIndividualBusinessStatsQuery,
  useGetbusinessByIdQuery,
  useGetIndividualBusinessStatsQuery,
  useLazyGetBusinessDeliveryInfoByIdQuery,
} = businessQueryApi;
