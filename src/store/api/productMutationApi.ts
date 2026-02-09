import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";
interface IBulkUpdateParams {
  productsId: string[];
  status?: string;
  isDeleted?: boolean;
}
export const productMutationApi = createApi({
  reducerPath: "productMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    initProductCreate: builder.mutation<any, { businessId: string }>({
      query: ({ businessId }) => ({
        url: `${endpoints.products}`,
        method: "POST",
        data: {
          businessId,
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

    bulkProductsUpdate: builder.mutation<any, IBulkUpdateParams>({
      query: (body) => ({
        url: endpoints.bulkProductsUpdate,
        method: "PATCH",
        data: body,
      }),
    }),
  }),
});

export const {
  useInitProductCreateMutation,
  useBulkProductsUpdateMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productMutationApi;
