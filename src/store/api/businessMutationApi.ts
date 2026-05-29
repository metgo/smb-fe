import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface IBulkUpdateParams {
  businessesId: string[];
  status?: string;
  isDeleted?: boolean;
}

/* ---------------- API ---------------- */
export const businessMutationApi = createApi({
  reducerPath: "businessMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Business"],
  endpoints: (builder) => ({
    initBusinessCreate: builder.mutation<any, void>({
      query: () => ({
        url: endpoints.businesses,
        method: "POST",
        data: { name: "" },
      }),
      invalidatesTags: ["Business"],
    }),
    deleteBusiness: builder.mutation<any, { businessId: string }>({
      query: ({ businessId }) => ({
        url: `${endpoints.business}/${businessId}`,
        method: "DELETE",
      }),
    }),
    updateBusiness: builder.mutation<any, { body: any; businessId: string }>({
      query: ({ body, businessId }) => ({
        url: `${endpoints.businesses}/${businessId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Business"],
    }),
    bulkBusinessesUpdate: builder.mutation<any, IBulkUpdateParams>({
      query: (body) => ({
        url: endpoints.bulkBusinessesUpdate,
        method: "PATCH",
        data: body,
      }),
    }),
    approveCategorySuggestion: builder.mutation<
      any,
      {
        itemId: string;
        itemType: TItemType;
        categoryTitle: string;
        notificationId: string;
      }
    >({
      query: ({ itemId, itemType, categoryTitle, notificationId }) => {
        const route =
          itemType.toUpperCase() === "PRODUCT" ? "products" : "businesses";
        return {
          url: `/${route}/${itemId}/approve-category`,
          method: "POST",
          data: { categoryTitle, notificationId },
        };
      },
    }),
  }),
});

export const {
  useInitBusinessCreateMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
  useBulkBusinessesUpdateMutation,
  useApproveCategorySuggestionMutation,
} = businessMutationApi;
