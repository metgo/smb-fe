import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

/* ---------------- API ---------------- */
export const contentMutationApi = createApi({
  reducerPath: "contentMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Content"],

  endpoints: (builder) => ({
    createContent: builder.mutation<any, any>({
      query: (payload) => ({
        url: endpoints.contentConfig,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Content"],
    }),

    updateContent: builder.mutation<any, { body: any; contentId: string }>({
      query: ({ body, contentId }) => ({
        url: `${endpoints.contentConfig}/${contentId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Content"],
    }),

    deleteContent: builder.mutation<any, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `${endpoints.contentConfig}/${eventId}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useCreateContentMutation, useUpdateContentMutation } =
  contentMutationApi;
