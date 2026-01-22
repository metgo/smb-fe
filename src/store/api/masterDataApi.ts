import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

interface Params {
  locale: Language;
  bussCategoryId?: string;
}

export const masterDataApi = createApi({
  reducerPath: "masterDataApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["MasterData"],
  endpoints: (builder) => ({
    getCategories: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.categories,
        method: "GET",
        params,
      }),
      providesTags: ["MasterData"],
      keepUnusedDataFor: 60 * 60 * 24,
    }),

    getSubCategories: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.subCategories,
        method: "GET",
        params,
      }),
      providesTags: ["MasterData"],
      keepUnusedDataFor: 60 * 60 * 24,
    }),

    getAccessibility: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.accessibility,
        method: "GET",
        params,
      }),
      providesTags: ["MasterData"],
      keepUnusedDataFor: 60 * 60 * 24,
    }),

    getGroupTypes: builder.query<any, Params>({
      query: (params) => ({
        url: endpoints.groupType,
        method: "GET",
        params,
      }),
      providesTags: ["MasterData"],
      keepUnusedDataFor: 60 * 60 * 24,
    }),

    getDmos: builder.query<any, void>({
      query: () => ({
        url: endpoints.dmos,
        method: "GET",
      }),
      providesTags: ["MasterData"],
      keepUnusedDataFor: 60 * 60 * 24,
    }),

    getAllWebsites: builder.query<Website[], void>({
      query: () => ({
        url: endpoints.websites,
        method: "GET",
      }),
    }),
    getAllSocialMedia: builder.query<any, void>({
      query: () => ({
        url: endpoints.socialmedia,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  useGetAccessibilityQuery,
  useGetGroupTypesQuery,
  useGetDmosQuery,
  useGetAllWebsitesQuery,
  useGetAllSocialMediaQuery,
} = masterDataApi;
