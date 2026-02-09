import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface IBulkUpdateParams {
  ordersId: string[];
  status?: string;
  isDeleted?: boolean;
}

/* ---------------- API ---------------- */
export const orderMutationApi = createApi({
  reducerPath: "orderMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    initOrderCreate: builder.mutation<any, void>({
      query: () => ({
        url: endpoints.businesses,
        method: "POST",
        data: { name: "" },
      }),
      invalidatesTags: ["Order"],
    }),
    deleteOrder: builder.mutation<any, { orderId: string }>({
      query: ({ orderId }) => ({
        url: `${endpoints.orders}/${orderId}`,
        method: "DELETE",
      }),
    }),
    updateOrder: builder.mutation<any, { body: any; orderId: string }>({
      query: ({ body, orderId }) => ({
        url: `${endpoints.orders}/${orderId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Order"],
    }),
    bulkOrdersUpdate: builder.mutation<any, IBulkUpdateParams>({
      query: (body) => ({
        url: endpoints.bulkOrdersUpdate,
        method: "PATCH",
        data: body,
      }),
    }),
  }),
});

export const {
  useInitOrderCreateMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useBulkOrdersUpdateMutation,
} = orderMutationApi;
