import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface IBulkUpdateParams {
  ordersId: string[];
  status?: string;
  isResend?: boolean;
}

/* ---------------- API ---------------- */
export const orderMutationApi = createApi({
  reducerPath: "orderMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    initOrderCreate: builder.mutation<any, void>({
      query: () => ({
        url: endpoints.orders,
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
    updateOrderStatus: builder.mutation<any, { body: any; orderId: string }>({
      query: ({ body, orderId }) => ({
        url: `${endpoints.orderStatus}/${orderId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Order"],
    }),
    updateProductOrderStatus: builder.mutation<
      any,
      { body: any; orderProductId: string }
    >({
      query: ({ body, orderProductId }) => ({
        url: `${endpoints.orderProductStatus}/${orderProductId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Order"],
    }),
    updateOrderConfirmation: builder.mutation<
      any,
      { body: any; orderId: string }
    >({
      query: ({ body, orderId }) => ({
        url: `${endpoints.orderConfirmation}/${orderId}`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useInitOrderCreateMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useBulkOrdersUpdateMutation,
  useUpdateOrderStatusMutation,
  useUpdateProductOrderStatusMutation,
  useUpdateOrderConfirmationMutation,
} = orderMutationApi;
