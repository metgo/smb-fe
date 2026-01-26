import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const distrbOverviewApi = createApi({
  reducerPath: "distrbOverviewApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Distribution"],
  endpoints: (builder) => ({
    getPopularBusiness: builder.query<any, void>({
      query: () => ({
        url: endpoints.popularBusiness,
        method: "GET",
      }),
      providesTags: ["Distribution"],
    }),
    getPopularProducts: builder.query<any, void>({
      query: () => ({
        url: endpoints.popularProducts,
        method: "GET",
      }),
      providesTags: ["Distribution"],
    }),
  }),
});

export const { useGetPopularProductsQuery, useGetPopularBusinessQuery } =
  distrbOverviewApi;
