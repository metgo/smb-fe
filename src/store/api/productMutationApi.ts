import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const productMutationApi = createApi({
  reducerPath: "productMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    initProductCreate: builder.mutation<any, { businessId: string }>({
      query: ({ businessId }) => ({
        url: `${endpoints.products}/${businessId}`,
        method: "POST",
        data: {
          name: "",
        },
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation<any, { body: any; productId: string }>({
      query: ({ body, productId }) => ({
        url: `${endpoints.products}/${productId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Product"],
    }),

    deleteProduct: builder.mutation<any, { productId: string }>({
      query: ({ productId }) => ({
        url: `${endpoints.products}/${productId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useInitProductCreateMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productMutationApi;
