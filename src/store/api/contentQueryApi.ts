import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

/* ---------------- API ---------------- */
export const contentQueryApi = createApi({
  reducerPath: "contentQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Content"],

  endpoints: (builder) => ({
    getContentByExternalId: builder.query<
      IContentTemplateResponse,
      { externalApiId: string }
    >({
      query: (params) => ({
        url: endpoints.contentConfig,
        method: "GET",
        params,
      }),
      providesTags: ["Content"],
    }),
  }),
});

export const { useGetContentByExternalIdQuery } = contentQueryApi;
