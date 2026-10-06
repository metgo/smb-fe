import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const emailConfigMutationApi = createApi({
  reducerPath: "emailConfigMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EmailConfig"],
  endpoints: (builder) => ({
    createEmailConfig: builder.mutation<any, IEmailConfigFormPayload>({
      query: (body) => ({
        url: endpoints.emailConfig,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["EmailConfig"],
    }),

    updateEmailConfig: builder.mutation<
      any,
      { id: string; body: Partial<IEmailConfigFormPayload> }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.emailConfig}/${id}`,
        method: "PUT",
        data: body,
      }),
      invalidatesTags: ["EmailConfig"],
    }),

    deleteEmailConfig: builder.mutation<any, string>({
      query: (id) => ({
        url: `${endpoints.emailConfig}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["EmailConfig"],
    }),

    previewEmailConfig: builder.mutation<
      any,
      { id: string; mergeVars: IEmailConfigMergeVars }
    >({
      query: ({ id, mergeVars }) => ({
        url: `${endpoints.emailConfig}/${id}/preview`,
        method: "POST",
        data: { mergeVars },
      }),
    }),

    testSendEmailConfig: builder.mutation<
      any,
      { id: string; to: string; mergeVars: IEmailConfigMergeVars }
    >({
      query: ({ id, to, mergeVars }) => ({
        url: `${endpoints.emailConfig}/${id}/test-send`,
        method: "POST",
        data: { to, mergeVars },
      }),
    }),

    syncEmailConfigs: builder.mutation<any, void>({
      query: () => ({
        url: `${endpoints.emailConfig}/sync`,
        method: "POST",
      }),
      invalidatesTags: ["EmailConfig"],
    }),
  }),
});

export const {
  useCreateEmailConfigMutation,
  useUpdateEmailConfigMutation,
  useDeleteEmailConfigMutation,
  usePreviewEmailConfigMutation,
  useTestSendEmailConfigMutation,
  useSyncEmailConfigsMutation,
} = emailConfigMutationApi;
