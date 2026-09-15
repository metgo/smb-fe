import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

// interface IBulkMiniSiteUpdateParams {
//   miniSitesId: string[];
//   status?: string;
//   isDeleted?: boolean;
// }

/* ---------------- API ---------------- */
export const miniSiteMutationApi = createApi({
  reducerPath: "miniSitesMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["MiniSites"],
  endpoints: (builder) => ({
    // POST → create minisite
    initMiniSiteCreate: builder.mutation<any, any>({
      query: (body) => ({
        url: endpoints.miniSites,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["MiniSites"],
    }),

    // PATCH → update minisite by id
    updateMiniSite: builder.mutation<any, { body: any; miniSiteId: string }>({
      query: ({ body, miniSiteId }) => ({
        url: `${endpoints.miniSites}/${miniSiteId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["MiniSites"],
    }),

    // DELETE → delete minisite by id
    deleteMiniSite: builder.mutation<any, { miniSiteId: string }>({
      query: ({ miniSiteId }) => ({
        url: `${endpoints.miniSites}/media/${miniSiteId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MiniSites"],
    }),

    minisiteVoucherUpload: builder.mutation<
      IMinisiteVoucherUploadRes[],
      IMinisiteVoucherUploadPayload
    >({
      query: (payload) => ({
        url: endpoints.miniSiteVoucherUpload,
        method: "POST",
        data: payload,
      }),
    }),

    // // BULK PATCH
    // bulkMiniSitesUpdate: builder.mutation<any, IBulkMiniSiteUpdateParams>({
    //   query: (body) => ({
    //     url: endpoints.bulkMiniSitesUpdate,
    //     method: "PATCH",
    //     data: body,
    //   }),
    // }),
  }),
});

export const {
  useInitMiniSiteCreateMutation,
  useUpdateMiniSiteMutation,
  useDeleteMiniSiteMutation,
  useMinisiteVoucherUploadMutation,
  // useBulkMiniSitesUpdateMutation,
} = miniSiteMutationApi;
