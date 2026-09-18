import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const orderQueryApi = createApi({
  reducerPath: "orderQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getAllOrders: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.orders,
        method: "GET",
        params,
      }),
    }),
    getAllOrderSummary: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.orderSummary,
        method: "GET",
        params,
      }),
    }),
    getOrderById: builder.query<IOrdersRes, { orderId: string | null }>({
      query: ({ orderId }) => ({
        url: `${endpoints.orderDetails}/${orderId}`,
        method: "GET",
      }),
    }),

    getOrderStats: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.ordersStats,
        method: "GET",
        params,
      }),
    }),

    getOfflineOrders: builder.query<
      IOfflineOrdersRes,
      { page: number; limit: number }
    >({
      query: (params) => ({
        url: endpoints.offlineOrders,
        method: "GET",
        params,
      }),
    }),

    createOfflineOrder: builder.mutation<IOfflineOrder, Partial<IOfflineOrder>>(
      {
        query: (data) => ({
          url: endpoints.offlineOrders,
          method: "POST",
          data,
        }),
      },
    ),

    updateOfflineOrder: builder.mutation<
      IOfflineOrder,
      { orderId: string; data: Partial<IOfflineOrder> }
    >({
      query: ({ orderId, data }) => ({
        url: `${endpoints.offlineOrders}/${orderId}`,
        method: "PATCH",
        data,
      }),
    }),

    deleteOfflineOrder: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `${endpoints.offlineOrders}/${orderId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetAllOrderSummaryQuery,
  useGetOrderByIdQuery,
  useGetOrderStatsQuery,

  useGetOfflineOrdersQuery,
  useCreateOfflineOrderMutation,
  useUpdateOfflineOrderMutation,
  useDeleteOfflineOrderMutation,
} = orderQueryApi;
