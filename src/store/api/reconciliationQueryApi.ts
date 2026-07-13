import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export interface CancelOrderProductRequest {
  orderId: string;
  orderProductId: string;
  cancelReason: string;
  additionalInfo?: string;
}

export const reconciliationQueryApi = createApi({
  reducerPath: "reconciliationQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Reconciliation"],
  endpoints: (builder) => ({
    getOrderProducts: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.orderProducts,
        method: "GET",
        params,
      }),
    }),

    // GET /order-products/details/:id
    getOrderProductDetails: builder.query<any, string>({
      query: (id) => ({
        url: `${endpoints.orderProductsDetails}/${id}`,
        method: "GET",
      }),
    }),

    // POST /cancel-order-product
    cancelOrderProduct: builder.mutation<void, CancelOrderProductRequest>({
      query: (body) => ({
        url: endpoints.cancelOrderProduct,
        method: "PATCH",
        data: body,
      }),
    }),
  }),
});

export const {
  useGetOrderProductsQuery,
  useGetOrderProductDetailsQuery,
  useCancelOrderProductMutation,
} = reconciliationQueryApi;