import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export interface DocumentPayload {
  title: string;
  externalApiId: string;
  templateKey: string;
  imageUrl?: string;
}

export const documentMutationApi = createApi({
  reducerPath: "documentMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Document"],

  endpoints: (builder) => ({
    createDocument: builder.mutation<any, DocumentPayload>({
      query: (payload) => ({
        url: endpoints.docUpload,
        method: "POST",
        data: payload,
      }),
    }),

    updateDocument: builder.mutation<
      any,
      { docId: string; payload: DocumentPayload }
    >({
      query: ({ docId, payload }) => ({
        url: `${endpoints.docUpload}/${docId}`,
        method: "PATCH",
        data: payload,
      }),
    }),

    getAllDocuments: builder.query<IDocumentRes, void>({
      query: () => ({
        url: endpoints.docUpload,
        method: "GET",
      }),
      providesTags: ["Document"],
    }),

    deleteDocument: builder.mutation<void, string>({
      query: (docId) => ({
        url: `${endpoints.docUpload}/${docId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Document"],
    }),

    checkTemplateKeyUsage: builder.query<
      { message: string },
      { externalApiId: string; templateKey: string }
    >({
      query: ({ externalApiId, templateKey }) => ({
        url: endpoints.checkTemplateKey,
        method: "GET",
        params: { externalApiId, templateKey },
      }),
    }),
  }),
});

export const {
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useGetAllDocumentsQuery,
  useDeleteDocumentMutation,
  useLazyCheckTemplateKeyUsageQuery,
} = documentMutationApi;
