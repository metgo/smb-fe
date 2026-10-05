import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const emailConfigQueryApi = createApi({
  reducerPath: "emailConfigQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["EmailConfig"],
  endpoints: (builder) => ({
    getEmailConfigs: builder.query<any, IEmailConfigListParams | void>({
      query: (params) => ({
        url: endpoints.emailConfig,
        method: "GET",
        params: params ?? undefined,
      }),
      providesTags: ["EmailConfig"],
    }),

    getEmailConfigById: builder.query<any, string>({
      query: (id) => ({
        url: `${endpoints.emailConfig}/${id}`,
        method: "GET",
      }),
      providesTags: ["EmailConfig"],
    }),
  }),
});

export const { useGetEmailConfigsQuery, useGetEmailConfigByIdQuery } =
  emailConfigQueryApi;
