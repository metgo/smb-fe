import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const websiteSettingsApi = createApi({
  reducerPath: "websiteSettingsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["WebsiteSettings"],

  endpoints: (builder) => ({
    createWebsiteSetting: builder.mutation<any, SiteSettingsFormData>({
      query: (body) => ({
        url: endpoints.websiteSettings,
        method: "POST",
        data: body,
      }),
    }),

    updateWebsiteSetting: builder.mutation<
      any,
      { id: string; body: Partial<SiteSettingsFormData> }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.websiteSettings}/${id}`,
        method: "PATCH",
        data: body,
      }),
    }),

    getWebsiteSettingDetails: builder.query<IWebsiteConfigRes, string | null>({
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
