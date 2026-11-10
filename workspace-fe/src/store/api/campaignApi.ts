import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const campaignApi = createApi({
  reducerPath: "campaignApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Campaign"],
  keepUnusedDataFor: 0,

  endpoints: (builder) => ({
    createCampaign: builder.mutation<any, Partial<ICampaignPayload>>({
      query: (body) => ({
        url: endpoints.campaign,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Campaign"],
    }),

    updateCampaign: builder.mutation<
      any,
      { id: string; body: Partial<ICampaignPayload> }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.campaign}/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["Campaign"],
    }),

    deleteCampaign: builder.mutation<any, string>({
      query: (id) => ({
        url: `${endpoints.campaign}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Campaign"],
    }),

    getAllAdminCampaigns: builder.query<ICampaignRes[], void>({
      query: () => ({
        url: endpoints.campaign,
        method: "GET",
      }),
      providesTags: ["Campaign"],
    }),

    getCampaignById: builder.query<ICampaignPayload, string>({
      query: (id) => ({
        url: `${endpoints.campaignDetails}/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useGetAllAdminCampaignsQuery,
  useGetCampaignByIdQuery,
} = campaignApi;
