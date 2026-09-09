import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export interface IUtmCampaign {
  _id: string;
  influencer: string | null;
  influencerEmail: string | null;
  influencerPhone: string | null;
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  campaignId: string | null;
  term: string | null;
  content: string | null;
  url: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUtmCampaignPayload {
  influencer?: string;
  influencerEmail?: string;
  influencerPhone?: string;
  baseUrl: string;
  source: string;
  medium: string;
  campaign: string;
  campaignId?: string;
  term?: string;
  content?: string;
}

interface GetAllUtmCampaignsParams {
  page?: number;
  limit?: number;
  search?: string;
  campaign?: string;
  source?: string;
}

interface UtmCampaignListResponse {
  data: IUtmCampaign[];
  totalData: number;
  meta?: {
    page: number;
    limit: number;
    data: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export const utmCampaignApi = createApi({
  reducerPath: "utmCampaignApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["UtmCampaign"],
  endpoints: (builder) => ({
    // GET /utm-campaigns
    getAllUtmCampaigns: builder.query<
      UtmCampaignListResponse,
      GetAllUtmCampaignsParams
    >({
      query: (params) => ({
        url: endpoints.utmCampaigns,
        method: "GET",
        params,
      }),
      providesTags: ["UtmCampaign"],
    }),

    // GET /utm-campaigns/{id}
    getUtmCampaignById: builder.query<IUtmCampaign, string>({
      query: (id) => ({
        url: `${endpoints.utmCampaigns}/${id}`,
        method: "GET",
      }),
      providesTags: ["UtmCampaign"],
    }),

    // POST /utm-campaigns
    createUtmCampaign: builder.mutation<
      { message: string; id: string },
      IUtmCampaignPayload
    >({
      query: (body) => ({
        url: endpoints.utmCampaigns,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["UtmCampaign"],
    }),

    // PATCH /utm-campaigns/{id}
    updateUtmCampaign: builder.mutation<
      { message: string },
      { id: string; body: Partial<IUtmCampaignPayload> }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.utmCampaigns}/${id}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["UtmCampaign"],
    }),

    // DELETE /utm-campaigns/{id}
    deleteUtmCampaign: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `${endpoints.utmCampaigns}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UtmCampaign"],
    }),
  }),
});

export const {
  useGetAllUtmCampaignsQuery,
  useGetUtmCampaignByIdQuery,
  useCreateUtmCampaignMutation,
  useUpdateUtmCampaignMutation,
  useDeleteUtmCampaignMutation,
} = utmCampaignApi;
