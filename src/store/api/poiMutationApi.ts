import { createApi } from "@reduxjs/toolkit/query/react";
import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface IBulkUpdateParams {
  poiIds: string[];
  status?: string;
  isDeleted?: boolean;
}

export const poiMutationApi = createApi({
  reducerPath: "poiMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["POI"],
  endpoints: (builder) => ({
    initPoiCreate: builder.mutation<any, void>({
      query: () => ({
        url: endpoints.pois,
        method: "POST",
        data: { name: "" },
      }),
      invalidatesTags: ["POI"],
    }),
    deletePoi: builder.mutation<any, { poiId: string }>({
      query: ({ poiId }) => ({
        url: `${endpoints.poi}/${poiId}`,
        method: "DELETE",
      }),
    }),
    updatePoi: builder.mutation<any, { body: any; poiId: string }>({
      query: ({ body, poiId }) => ({
        url: `${endpoints.pois}/${poiId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["POI"],
    }),
    bulkPoisUpdate: builder.mutation<any, IBulkUpdateParams>({
      query: (body) => ({
        url: endpoints.bulkPoisUpdate,
        method: "PATCH",
        data: body,
      }),
    }),
  }),
});

export const {
  useInitPoiCreateMutation,
  useUpdatePoiMutation,
  useDeletePoiMutation,
  useBulkPoisUpdateMutation,
} = poiMutationApi;
