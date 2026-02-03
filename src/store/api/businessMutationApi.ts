import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

/* ---------------- Payload Union ---------------- */
export type BusinessStepPayload =
  | BusinessBasicInfoPayload
  | BusinessContactPayload;

/* ---------------- API ---------------- */
export const businessMutationApi = createApi({
  reducerPath: "businessMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Business"],
  endpoints: (builder) => ({
    initBusinessCreate: builder.mutation<any, void>({
      query: () => ({
        url: endpoints.businesses,
        method: "POST",
        data: { name: "" },
      }),
      invalidatesTags: ["Business"],
    }),
    deleteBusiness: builder.mutation<any, { slug: string }>({
      query: ({ slug }) => ({
        url: `${endpoints.business}/${slug}`,
        method: "DELETE",
      }),
    }),
    updateBusiness: builder.mutation<any, { body: any; businessId: string }>({
      query: ({ body, businessId }) => ({
        url: `${endpoints.businesses}/${businessId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Business"],
    }),
  }),
});

export const {
  useInitBusinessCreateMutation,
  useUpdateBusinessMutation,
  useDeleteBusinessMutation,
} = businessMutationApi;
