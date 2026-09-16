import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface MiniSiteListParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  sortOrder?: string;
  sortBy?: string;
  startDate?: string;
  endDate?: string;
}

export const miniSiteQueryApi = createApi({
  reducerPath: "miniSiteQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["MiniSite"],
  endpoints: (builder) => {
    return {
      getMiniSiteStats: builder.query<IMiniSiteStatsRes, any>({
        query: () => ({
          url: endpoints.miniSitesStats,
          method: "GET",
        }),
      }),

      getAllMiniSites: builder.query<ICampaignsRes, MiniSiteListParams>({
        query: (params) => ({
          url: endpoints.miniSites,
          method: "GET",
          params,
        }),
      }),

      getMiniSiteById: builder.query<
        IMinisiteDetailsRes,
        { miniSiteId: string }
      >({
        query: ({ miniSiteId }) => ({
          url: `${endpoints.miniSites}/${miniSiteId}`,
          method: "GET",
        }),
        providesTags: ["MiniSite"],
      }),

      updateMiniSiteStatus: builder.mutation<
        any,
        { miniSiteId: string; status: string }
      >({
        query: ({ miniSiteId, status }) => ({
          url: `${endpoints.miniSites}/${miniSiteId}`,
          method: "PATCH",
          data: { status },
        }),
        invalidatesTags: ["MiniSite"],
      }),

      getVoucherUsage: builder.query<any, string>({
        query: (voucherId) => ({
          url: `${endpoints.voucherUsage}?voucherId=${voucherId}`,
          method: "GET",
        }),
      }),
    };
  },
});

export const {
  useGetMiniSiteStatsQuery,
  useGetAllMiniSitesQuery,
  useGetMiniSiteByIdQuery,
  useUpdateMiniSiteStatusMutation,
  useGetVoucherUsageQuery,
} = miniSiteQueryApi;
