import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

/* ---------------- API ---------------- */
export const contentQueryApi = createApi({
  reducerPath: "contentQueryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Content", "Views"],

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

    getAllViews: builder.query<IView[], { externalApiId: string }>({
      query: (params) => ({
        url: endpoints.contentConfig,
        method: "GET",
        params: { ...params, all: true },
      }),
      providesTags: ["Views"],
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response?.data && Array.isArray(response.data))
          return response.data;
        if (response?._id) return [response];
        return [];
      },
    }),

    getViewById: builder.query<IView, { viewId: string }>({
      query: ({ viewId }) => ({
        url: `${endpoints.contentConfig}/${viewId}`,
        method: "GET",
      }),
      providesTags: ["Views"],
    }),
  }),
});

export const {
  useGetContentByExternalIdQuery,
  useGetAllViewsQuery,
  useGetViewByIdQuery,
} = contentQueryApi;
