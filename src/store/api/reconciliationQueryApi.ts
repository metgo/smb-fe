import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

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
  }),
});

export const { useGetOrderProductsQuery } = reconciliationQueryApi;
