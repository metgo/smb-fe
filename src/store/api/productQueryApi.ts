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
        url: endpoints.products,
        method: "GET",
        params,
      }),
    }),
  }),
});
export const { useGetAllProductsQuery } = productQueryApi;
