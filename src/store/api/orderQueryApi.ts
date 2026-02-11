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

    getOrdersStats: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.ordersStats,
        method: "GET",
        params,
      }),
    }),

    getOrderById: builder.query<any, { orderId: string | null }>({
      query: ({ orderId }) => ({
        url: `${endpoints.orders}/${orderId}`,
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

    // getOrderStatsById: builder.query<any, string>({
    //   query: (id) => ({
    //     url: `${endpoints.ordersStats}`,
    //     method: "GET",
    //     params: { productId: id },
    //   }),
    // }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrdersStatsQuery,
} = orderQueryApi;
