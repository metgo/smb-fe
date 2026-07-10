import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const productQueryApi = createApi({
  reducerPath: "productQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getAllProducts: builder.query<any, any>({
      query: (params) => ({
        url: `${endpoints.products}?sortBy=DESC`,
        method: "GET",
        params,
      }),
    }),
    getProductbyId: builder.query<any, { productId: string | null }>({
      query: ({ productId }) => ({
        url: `${endpoints.products}/${productId}`,
        method: "GET",
      }),
      keepUnusedDataFor: 0,
    }),
    getProductStats: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.productsStats,
        method: "GET",
        params,
      }),
    }),
    getProductStatsById: builder.query<any, string>({
      query: (id) => ({
        url: `${endpoints.productsStats}`, // just the base URL
        method: "GET",
        params: { productId: id }, // send as query parameter
      }),
    }),
    getContentManagementProducts: builder.query<any, any>({
      query: (params) => ({
        url: `${endpoints.contentManagementProducts}?sortBy=DESC`,
        method: "GET",
        params,
      }),
    }),
  }),
});
export const {
  useGetAllProductsQuery,
  useGetProductbyIdQuery,
  useLazyGetProductbyIdQuery,
  useGetProductStatsQuery,
  useGetProductStatsByIdQuery,
  useGetContentManagementProductsQuery,
} = productQueryApi;
