import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export interface DocumentPayload {
  title: string;
  externalApiId: string;
  templateKey: string;
  imageUrl: string;
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
        method: "POST",
        data: payload,
      }),
    }),

    getDocument: builder.query<any, string>({
      query: (docId) => ({
        url: `${endpoints.docUpload}/${docId}`,
        method: "GET",
      }),
      providesTags: ["Document"],
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
  }),
});

export const {
  useCreateDocumentMutation,
  useUpdateDocumentMutation,
  useGetAllDocumentsQuery,
  useGetDocumentQuery,
  useDeleteDocumentMutation,
} = documentMutationApi;
