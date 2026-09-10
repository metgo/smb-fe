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
  page?: string | number;
  limit?: string | number;
  search?: string;
  businessType?: string;
  status?: string;
  isRegistration?: boolean;
  isFree?: boolean;
  authorityId?: boolean | string;
  dmoId?: boolean | string;
  hasProductFilter?: string | boolean;
  sortOrder?: string;
  sortBy?: string;
  startDate?: string;
  endDate?: string;
  externalApiId?: string;
  locale?: string;
  primaryCategoryId?: string;
  assignmentStatus?: string;
  viewCategory?: string;
  viewId?: string;
}

interface BusinessesForProductParams {
  locale: Language;
  limit: number;
  search?: string;
  status?: string;
  authorityId?: string;
  dmoId?: string;
  page?: number;
  startDate?: string;
  endDate?: string;
}

interface ChangeHistoryParams {
  entityType: "business" | "product" | "event" | "poi";
  entityId: string;
}

interface ApproveChangesParams {
  entityType: "business" | "product" | "event" | "poi";
  entityId: string;
  changeId: string;
  comment?: string;
}

interface RejectChangesParams {
  entityType: "business" | "product" | "event" | "poi";
  entityId: string;
  changeId: string;
  reason: string;
}

export const businessQueryApi = createApi({
  reducerPath: "businessQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Business"],

  endpoints: (builder) => ({
    getAllbusinesses: builder.query<IBusinessesRes, BusinessListParams>({
      query: (params) => ({
        url: `${endpoints.businesses}?sortBy=DESC`,
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
      keepUnusedDataFor: 0,
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

    getPendingApprovals: builder.query<any, { page?: number; limit?: number }>({
      query: (params) => ({
        url: endpoints.pendingApprovals,
        method: "GET",
        params,
      }),
      providesTags: ["Business"],
    }),

    getChangesByEntity: builder.query<any, ChangeHistoryParams>({
      query: ({ entityType, entityId }) => ({
        url: `/admin/${entityType}/${entityId}/changes`,
        method: "GET",
      }),
      providesTags: ["Business"],
    }),

    approveChanges: builder.mutation<any, ApproveChangesParams>({
      query: ({ entityType, entityId, changeId, comment }) => ({
        url: `/admin/${entityType}/${entityId}/changes/${changeId}/approve`,
        method: "PATCH",
        data: { approvalComment: comment },
      }),
      invalidatesTags: ["Business"],
    }),

    rejectChanges: builder.mutation<any, RejectChangesParams>({
      query: ({ entityType, entityId, changeId, reason }) => ({
        url: `/admin/${entityType}/${entityId}/changes/${changeId}/reject`,
        method: "PATCH",
        data: { rejectionReason: reason },
      }),
      invalidatesTags: ["Business"],
    }),
  }),
});

export const {
  useGetAllbusinessesQuery,
  useLazyGetAllbusinessesQuery,
  useGetBusinessForProductQuery,
  useLazyGetBusinessForProductQuery,
  useGetBusinessStatsQuery,
  useLazyGetIndividualBusinessStatsQuery,
  useGetbusinessByIdQuery,
  useGetIndividualBusinessStatsQuery,
  useLazyGetBusinessDeliveryInfoByIdQuery,
  useGetPendingApprovalsQuery,
  useGetChangesByEntityQuery,
  useApproveChangesMutation,
  useRejectChangesMutation,
} = businessQueryApi;
