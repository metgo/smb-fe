import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export interface ISiteAnalyticsSecretStatus {
  isSet: boolean;
  updatedAt: string | null;
}

const secretUrl = (websiteId: string) =>
  `/external-api/${websiteId}/analytics-secret`;

// GA4 Measurement Protocol API secret per website. The server never returns
// the secret - only whether one is set.
export const siteAnalyticsApi = createApi({
  reducerPath: "siteAnalyticsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AnalyticsSecret"],
  endpoints: (builder) => ({
    getAnalyticsSecretStatus: builder.query<ISiteAnalyticsSecretStatus, string>(
      {
        query: (websiteId) => ({ url: secretUrl(websiteId), method: "GET" }),
        providesTags: ["AnalyticsSecret"],
      },
    ),
    setAnalyticsSecret: builder.mutation<
      ISiteAnalyticsSecretStatus,
      { websiteId: string; gaApiSecret: string }
    >({
      query: ({ websiteId, gaApiSecret }) => ({
        url: secretUrl(websiteId),
        method: "PUT",
        data: { gaApiSecret },
      }),
      invalidatesTags: ["AnalyticsSecret"],
    }),
    removeAnalyticsSecret: builder.mutation<ISiteAnalyticsSecretStatus, string>(
      {
        query: (websiteId) => ({ url: secretUrl(websiteId), method: "DELETE" }),
        invalidatesTags: ["AnalyticsSecret"],
      },
    ),
  }),
});

export const {
  useGetAnalyticsSecretStatusQuery,
  useSetAnalyticsSecretMutation,
  useRemoveAnalyticsSecretMutation,
} = siteAnalyticsApi;
