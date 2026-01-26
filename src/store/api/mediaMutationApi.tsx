import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const mediaMutationApi = createApi({
  reducerPath: "mediaMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Media"],

  endpoints: (builder) => ({
    createSignedUrl: builder.mutation<any, SignedUrlPayload[]>({
      query: (body) => ({
        url: endpoints.mediaSignedUrl,
        method: "POST",
        data: { items: body },
      }),
    }),

    deleteMedia: builder.mutation<any, { imageUrl: string }>({
      query: ({ imageUrl }) => ({
        url: endpoints.mediaFileDelete,
        method: "DELETE",
        data: { imageUrl },
      }),
    }),
  }),
});

export const { useCreateSignedUrlMutation, useDeleteMediaMutation } =
  mediaMutationApi;
