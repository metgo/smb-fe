import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const websiteSettingsApi = createApi({
  reducerPath: "websiteSettingsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["WebsiteSettings"],

  endpoints: (builder) => ({
    createWebsiteSetting: builder.mutation<any, SignedUrlPayload>({
      query: (body) => ({
        url: endpoints.websiteSettings,
        method: "POST",
        data: body,
      }),
    }),

    updateWebsiteSetting: builder.mutation<any, SignedUrlPayload>({
      query: (body) => ({
        url: endpoints.websiteSettings,
        method: "PATCH",
        data: body,
      }),
    }),

    getWebsiteSettingDetails: builder.query<any, string>({
      query: (externalApiId) => ({
        url: `${endpoints.websiteSettings}/external-api/${externalApiId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateWebsiteSettingMutation,
  useUpdateWebsiteSettingMutation,
  useGetWebsiteSettingDetailsQuery,
} = websiteSettingsApi;
