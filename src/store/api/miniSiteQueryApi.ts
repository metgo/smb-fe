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
      getAllMiniSites: builder.query<any, MiniSiteListParams>({
        query: (params) => ({
          url: endpoints.miniSites,
          method: "GET",
          params,
        }),
      }),

      getMiniSiteById: builder.query<any, { miniSiteId: string }>({
        query: ({ miniSiteId }) => ({
          url: `${endpoints.miniSites}/${miniSiteId}`,
          method: "GET",
        }),
      }),
    };
  },
});

export const { useGetAllMiniSitesQuery, useGetMiniSiteByIdQuery } =
  miniSiteQueryApi;
