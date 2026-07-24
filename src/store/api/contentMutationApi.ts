import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

/* ---------------- API ---------------- */
export const contentMutationApi = createApi({
  reducerPath: "contentMutationApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Content", "Views"],

  endpoints: (builder) => ({
    createContent: builder.mutation<any, any>({
      query: (payload) => ({
        url: endpoints.contentConfig,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: ["Content", "Views"],
    }),

    updateContent: builder.mutation<any, { body: any; contentId: string }>({
      query: ({ body, contentId }) => ({
        url: `${endpoints.contentConfig}/${contentId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Content", "Views"],
    }),

    deleteContent: builder.mutation<any, { eventId: string }>({
      query: ({ eventId }) => ({
        url: `${endpoints.contentConfig}/${eventId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Content", "Views"],
    }),

    activateView: builder.mutation<any, { viewId: string }>({
      query: ({ viewId }) => ({
        url: `${endpoints.contentConfigActivate}/${viewId}/activate`,
        method: "PATCH",
      }),
      invalidatesTags: ["Content", "Views"],
    }),

    generateTopics: builder.mutation<
      WizardTopic[],
      { externalApiId: string; themeContext?: string }
    >({
      query: (body) => ({
        url: endpoints.wizardGenerateTopics,
        method: "POST",
        data: body,
      }),
    }),

    generateCategories: builder.mutation<
      WizardCategory[],
      {
        topicTitle: string;
        topicDescription: string;
        externalApiId: string;
        existingCategories?: string[];
      }
    >({
      query: (body) => ({
        url: endpoints.wizardGenerateCategories,
        method: "POST",
        data: body,
      }),
    }),

    generateUnified: builder.mutation<
      {
        topics: Array<{
          title: string;
          titleHe: string;
          titleAr: string;
          description: string;
          descriptionHe: string;
          descriptionAr: string;
          categories: Array<{
            title: string;
            titleHe: string;
            titleAr: string;
            description: string;
            descriptionHe: string;
            descriptionAr: string;
            synonyms: string[];
            synonymsHe: string[];
            synonymsAr: string[];
            searchKeywords: string[];
            searchKeywordsHe: string[];
            searchKeywordsAr: string[];
          }>;
        }>;
      },
      { externalApiId: string; themeContext?: string }
    >({
      query: (body) => ({
        url: endpoints.wizardGenerateUnified,
        method: "POST",
        data: body,
      }),
    }),

    assignAllEntities: builder.mutation<
      {
        summary: {
          categoryId: string;
          businessCount: number;
          productCount: number;
        }[];
        unassignedCount: number;
      },
      { viewId: string; reAssignAll?: boolean }
    >({
      query: (body) => ({
        url: endpoints.wizardAssignEntities,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Content", "Views"],
    }),

    translateTopic: builder.mutation<
      {
        title: string;
        titleHe: string;
        titleAr: string;
        description: string;
        descriptionHe: string;
        descriptionAr: string;
      },
      { title: string; description?: string }
    >({
      query: (body) => ({
        url: endpoints.wizardTranslate,
        method: "POST",
        data: body,
      }),
    }),

    aiSuggestCategoryEntities: builder.mutation<
      {
        businesses: IAiSuggestedEntity[];
        products: IAiSuggestedEntity[];
        aiUnavailable?: boolean;
      },
      {
        categoryName: string;
        categoryDescription: string;
        externalApiId?: string;
      }
    >({
      query: (body) => ({
        url: "/ai/suggest-category-entities",
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export interface IAiSuggestedEntity {
  _id: string;
  name: string;
  description: string;
  images: { image: string }[];
  matchReason: string;
}

export const {
  useCreateContentMutation,
  useUpdateContentMutation,
  useDeleteContentMutation,
  useActivateViewMutation,
  useGenerateTopicsMutation,
  useGenerateCategoriesMutation,
  useGenerateUnifiedMutation,
  useAssignAllEntitiesMutation,
  useAiSuggestCategoryEntitiesMutation,
  useTranslateTopicMutation,
} = contentMutationApi;
