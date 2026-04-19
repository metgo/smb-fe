import { createApi } from "@reduxjs/toolkit/query/react";

import { endpoints } from "@/lib/endpoints";
import { axiosBaseQuery } from "./axiosBaseQuery";

interface GetPromotionsParams {
  page?: number;
  limit?: number;
  placement?: string;
  isActive?: boolean;
  externalApiId?: string;
  search?: string;
}

interface PaginatedPromotionsRes {
  data: IPromotion[];
  total: number;
  page: number;
  limit: number;
}

interface IPromotionGroup {
  externalApiId: string;
  promotions: IPromotion[];
}

export const promotionsApi = createApi({
  reducerPath: "promotionsApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Promotion", "PromotionGroup"],

  endpoints: (builder) => ({
    // Promotions
    createPromotion: builder.mutation<IPromotion, IPromotionFromData>({
      query: (body) => ({
        url: endpoints.promotions,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Promotion"],
    }),

    updatePromotion: builder.mutation<
      IPromotion,
      { promotionId: string; body: Partial<IPromotionFromData> }
    >({
      query: ({ promotionId, body }) => ({
        url: `${endpoints.promotions}/${promotionId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Promotion"],
    }),

    deletePromotion: builder.mutation<void, string>({
      query: (promotionId) => ({
        url: `${endpoints.promotions}/${promotionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Promotion"],
    }),

    getPromotions: builder.query<PaginatedPromotionsRes, GetPromotionsParams>({
      query: (params) => ({
        url: endpoints.promotions,
        method: "GET",
        params,
      }),
      providesTags: ["Promotion"],
    }),

    togglePromotionStatus: builder.mutation<
      IPromotion,
      { promotionId: string; status: boolean }
    >({
      query: ({ promotionId, status }) => ({
        url: `${endpoints.promotions}/${promotionId}`,
        method: "PATCH",
        data: { isActive: status },
      }),
      invalidatesTags: ["Promotion"],
    }),

    getPromotionsByExtApiId: builder.query<IPromotionsRes[], string>({
      query: (externalApiIdId) => ({
        url: `${endpoints.promotions}/${externalApiIdId}`,
        method: "GET",
      }),
      providesTags: ["Promotion"],
    }),

    duplicatePromotion: builder.mutation<IPromotion, string>({
      query: (promotionId) => ({
        url: `${endpoints.promotions}/${promotionId}/copy`,
        method: "POST",
      }),
      invalidatesTags: ["Promotion"],
    }),

    // Promotion Groups
    createPromotionGroup: builder.mutation<
      IPromotionGroup,
      IPromotionGroupFormData
    >({
      query: (body) => ({
        url: endpoints.promotionGroups,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["PromotionGroup"],
    }),

    updatePromotionGroup: builder.mutation<
      IPromotionGroup,
      { externalApiId: string; body: Partial<IPromotionGroupFormData> }
    >({
      query: ({ externalApiId, body }) => ({
        url: `${endpoints.promotionGroups}/${externalApiId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["PromotionGroup"],
    }),

    getPromotionGroup: builder.query<IPromotionGroup, string>({
      query: (externalApiId) => ({
        url: `${endpoints.promotionGroups}/${externalApiId}`,
        method: "GET",
      }),
      providesTags: ["PromotionGroup"],
    }),
  }),
});

export const {
  useCreatePromotionMutation,
  useUpdatePromotionMutation,
  useDeletePromotionMutation,
  useGetPromotionsQuery,
  useDuplicatePromotionMutation,
  useGetPromotionsByExtApiIdQuery,
  useTogglePromotionStatusMutation,
  useCreatePromotionGroupMutation,
  useUpdatePromotionGroupMutation,
  useGetPromotionGroupQuery,
} = promotionsApi;
