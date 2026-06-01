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
    getAllIcons: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.icons,
        method: "GET",
        params,
      }),
      providesTags: ["MasterData"],
      keepUnusedDataFor: 60 * 60 * 24,
    }),

    getAllTags: builder.query<TAllTags, void>({
      query: () => ({
        url: endpoints.tags,
        method: "GET",
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
    getAllCampaigns: builder.query<any, any>({
      query: (params) => ({
        url: endpoints.campaign,
        method: "GET",
        params,
      }),
      providesTags: ["MasterData"],
      keepUnusedDataFor: 60 * 60 * 24,
    }),
    getDmos: builder.query<any, void>({
      query: () => ({
        url: endpoints.dmosAuthorities,
        method: "GET",
      }),
      providesTags: ["MasterData"],
      keepUnusedDataFor: 60 * 60 * 24,
    }),

    getAllWebsites: builder.query<TAllWebsites, void>({
      query: () => ({
        url: endpoints.websites,
        method: "GET",
      }),
    }),

    getUserByEmail: builder.query<any, { email: string }>({
      query: ({ email }) => ({
        url: `${endpoints.users}/${encodeURIComponent(email)}`,
        method: "GET",
      }),
    }),

    postUserAdmin: builder.mutation<any, any>({
      query: (formData) => ({
        url: endpoints.userAdmin,
        method: "POST",
        data: formData,
      }),
    }),

    generateTags: builder.mutation<any, any>({
      query: (payload) => ({
        url: endpoints.generateTags,
        method: "POST",
        data: payload,
      }),
    }),

    patchBusinessOwner: builder.mutation<any, any>({
      query: (body) => ({
        url: endpoints.changeOwner,
        method: "PATCH",
        data: body,
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
  useGenerateTagsMutation,
  useGetCategoriesQuery,
  useGetSubCategoriesQuery,
  usePatchBusinessOwnerMutation,
  useGetAccessibilityQuery,
  useGetGroupTypesQuery,
  useGetAllIconsQuery,
  useGetDmosQuery,
  usePostUserAdminMutation,
  useLazyGetUserByEmailQuery,
  useGetAllWebsitesQuery,
  useGetAllSocialMediaQuery,
  useGetAllTagsQuery,
  useGetAllCampaignsQuery,
} = masterDataApi;
