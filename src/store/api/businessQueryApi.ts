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

      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        // serialize to a string that includes page and search/filter params
        const { page, search, status, authorityId, dmoId, hasProductFilter } =
          queryArgs;

        // Important: only serialize params relevant to cache differentiation
        return `${endpointName}-${page}-${search || ""}-${status || ""}-${authorityId || ""}-${dmoId || ""}-${hasProductFilter !== undefined ? hasProductFilter : ""}`;
      },
      // 🔑 merge new page data into cache
      merge: (currentCache, newData) => {
        currentCache.data.push(...newData.data);
        currentCache.meta = newData.meta;
      },

      // 🔑 refetch when page changes
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.page !== previousArg?.page;
      },
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
