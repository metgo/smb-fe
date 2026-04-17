import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const documentMutationApi = createApi({
  reducerPath: "documentMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Document"],

  endpoints: (builder) => ({
    uploadDocument: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: endpoints.docUpload,
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    }),
    getDocument: builder.query<any, void | string | number>({
      query: () => ({
        url: endpoints.docUpload,
        method: "GET",
      }),
      providesTags: ["Document"],
    }),
  }),
});

export const { useUploadDocumentMutation, useGetDocumentQuery } =
  documentMutationApi;
