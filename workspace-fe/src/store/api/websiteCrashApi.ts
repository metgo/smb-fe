import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export interface IWebsiteCrashUser {
  _id: string;
  name: string;
  email: string;
}

export interface IWebsiteCrashBrowser {
  name: string;
  version: string;
}

export interface IWebsiteCrashOS {
  name: string;
  version: string;
}

export interface IWebsiteCrashNetwork {
  online: boolean;
  connectionType: string;
}

export interface IWebsiteCrashDevice {
  userAgent: string;
  platform: string;
  language: string;
  screenResolution: string;
  viewportSize: string;
  browser: IWebsiteCrashBrowser;
  os: IWebsiteCrashOS;
  deviceType: "mobile" | "tablet" | "desktop";
  network: IWebsiteCrashNetwork;
}

export interface IWebsiteCrashError {
  message: string;
  name: string;
  stack: string;
  status: number;
  url: string;
  referrer: string;
}

export interface IWebsiteCrash {
  _id: string;
  user: IWebsiteCrashUser | null;
  timestamp: string;
  timezone: string;
  device: IWebsiteCrashDevice;
  error: IWebsiteCrashError;
  createdAt: string;
}

interface GetAllCrashesParams {
  page?: number;
  limit?: number;
  search?: string;
  errorName?: string;
  userId?: string;
}

interface CrashListResponse {
  data: IWebsiteCrash[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

export const websiteCrashApi = createApi({
  reducerPath: "websiteCrashApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["WebsiteCrash"],
  endpoints: (builder) => ({
    getAllCrashes: builder.query<CrashListResponse, GetAllCrashesParams>({
      query: (params) => ({
        url: endpoints.websiteCrashes,
        method: "GET",
        params,
      }),
      providesTags: ["WebsiteCrash"],
    }),

    getCrashById: builder.query<IWebsiteCrash, string>({
      query: (crashId) => ({
        url: `${endpoints.websiteCrashes}/${crashId}`,
        method: "GET",
      }),
      providesTags: ["WebsiteCrash"],
    }),

    deleteCrash: builder.mutation<void, string>({
      query: (crashId) => ({
        url: `${endpoints.websiteCrashes}/${crashId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["WebsiteCrash"],
    }),
  }),
});

export const {
  useGetAllCrashesQuery,
  useGetCrashByIdQuery,
  useDeleteCrashMutation,
} = websiteCrashApi;
