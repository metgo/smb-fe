import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface WebsiteAccessItemProps {
  blacklist: {
    allItems: string[];
    selectedItems: string[];
  };
  whitelist: {
    allItems: string[];
    selectedItems: string[];
  };
  purpose: string;
}

export interface SiteErrorReportPayload {
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  device: {
    userAgent: string;
    platform: string;
    language: string;
    screenResolution: string;
    viewportSize: string;
    browser: { name: string; version: string };
    os: { name: string; version: string };
    deviceType: "mobile" | "tablet" | "desktop";
    network: { online: boolean; connectionType: string };
  };
  error: {
    message: string;
    name: string;
    stack?: string;
    status?: number;
    url: string;
    referrer: string | null;
  };
  timestamp: string;
  timezone: string;
}

export const commonMutationApi = createApi({
  reducerPath: "commonMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["common", "Business", "POI", "Event"],
  endpoints: (builder) => ({
    createWebsiteAccessItem: builder.mutation<
      any,
      { body: WebsiteAccessItemProps; itemId: string }
    >({
      query: ({ body, itemId }) => ({
        url: `${endpoints.websiteAccessItem}/${itemId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["common", "Business", "POI", "Event"],
    }),
    reportSiteError: builder.mutation<any, SiteErrorReportPayload>({
      query: (body) => ({
        url: endpoints.websiteCrashes,
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const {
  useCreateWebsiteAccessItemMutation,
  useReportSiteErrorMutation,
} = commonMutationApi;
