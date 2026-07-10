import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const websiteConfigApi = createApi({
  reducerPath: "websiteConfigApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["WebsiteConfig"],

  endpoints: (builder) => ({
    //  ============== Website Setting Config ==============
    createWebsiteSetting: builder.mutation<any, ISiteSettingsFormData>({
      query: (body) => ({
        url: endpoints.websiteSettings,
        method: "POST",
        data: body,
      }),
    }),

    updateWebsiteSetting: builder.mutation<
      any,
      { id: string; body: Partial<ISiteSettingsFormData> }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.websiteSettings}/${id}`,
        method: "PATCH",
        data: body,
      }),
    }),

    deleteWebsite: builder.mutation<any, string>({
      query: (id) => ({
        url: `${endpoints.websiteSettings}/${id}`,
        method: "DELETE",
      }),
    }),

    getWebsiteSettingDetails: builder.query<IWebsiteConfigRes, string | null>({
      query: (id) => ({
        url: `${endpoints.websiteSettings}/${id}`,
        method: "GET",
      }),
    }),

    getAllWebsites: builder.query<IWebsiteRes[], void>({
      query: () => ({
        url: endpoints.websiteSettings,
        method: "GET",
      }),
    }),

    getAllWebsiteList: builder.query<IWebsiteListRes[], Language>({
      query: (locale) => ({
        url: `${endpoints.websiteList}?locale=${locale}`,
        method: "GET",
      }),
    }),

    //  ============== DMOs Config ==============
    // Mutations
    createDmo: builder.mutation<any, TDmoReqPayload>({
      query: (body) => ({
        url: endpoints.dmos,
        method: "POST",
        data: body,
      }),
    }),
    updateDmo: builder.mutation<
      any,
      { id: string; body: Partial<TDmoReqPayload> }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.dmos}/${id}`,
        method: "PATCH",
        data: body,
      }),
    }),
    deleteDmo: builder.mutation<any, string>({
      query: (id) => ({
        url: `${endpoints.dmos}/${id}`,
        method: "DELETE",
      }),
    }),

    // Queries
    getAllDmos: builder.query<IDmoRes[], void>({
      query: () => ({
        url: endpoints.dmos,
        method: "GET",
      }),
    }),

    getDmoById: builder.query<TDmoEditData, string>({
      query: (id) => ({
        url: `${endpoints.dmos}/${id}`,
        method: "GET",
      }),
    }),

    //  ============== Authorities Config ==============
    // Mutations
    createAuthority: builder.mutation<any, IAuthorityReqPayload>({
      query: (body) => ({
        url: endpoints.authorities,
        method: "POST",
        data: body,
      }),
    }),
    updateAuthority: builder.mutation<
      any,
      { id: string; body: Partial<IAuthorityReqPayload> }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.authorities}/${id}`,
        method: "PATCH",
        data: body,
      }),
    }),
    deleteAuthority: builder.mutation<any, string>({
      query: (id) => ({
        url: `${endpoints.authorities}/${id}`,
        method: "DELETE",
      }),
    }),

    // Queries
    getAuthoritiesByDmoId: builder.query<IAuthorityRes[], string>({
      query: (dmoId) => ({
        url: `${endpoints.authorities}/by-dmo-id/${dmoId}`,
        method: "GET",
      }),
    }),

    getAuthorityById: builder.query<any, string>({
      query: (id) => ({
        url: `${endpoints.authorities}/${id}`,
        method: "GET",
      }),
    }),

    //  ============== Campaign Config ==============
    // Mutations
    createCampaign: builder.mutation<any, IAuthorityReqPayload>({
      query: (body) => ({
        url: endpoints.campaigns,
        method: "POST",
        data: body,
      }),
    }),
    updateCampaign: builder.mutation<
      any,
      { id: string; body: Partial<IAuthorityReqPayload> }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.campaigns}/${id}`,
        method: "PATCH",
        data: body,
      }),
    }),
    deleteCampaign: builder.mutation<any, string>({
      query: (id) => ({
        url: `${endpoints.campaigns}/${id}`,
        method: "DELETE",
      }),
    }),

    // Queries
    getAllCampaigns: builder.query<ICampaignRes[], TCampaign | void>({
      query: (type) => ({
        url: type ? `${endpoints.campaigns}?type=${type}` : endpoints.campaigns,
        method: "GET",
      }),
    }),

    getCampaignById: builder.query<any, string>({
      query: (id) => ({
        url: `${endpoints.campaigns}/${id}`,
        method: "GET",
      }),
    }),

    //  ============== Partners Config ==============
    createPartner: builder.mutation<IPartnerItem, Omit<IPartnerItem, "_id">>({
      query: (body) => ({
        url: endpoints.partners,
        method: "POST",
        data: body,
      }),
    }),
    updatePartner: builder.mutation<
      IPartnerItem,
      { id: string; body: Partial<Omit<IPartnerItem, "_id">> }
    >({
      query: ({ id, body }) => ({
        url: `${endpoints.partners}/${id}`,
        method: "PATCH",
        data: body,
      }),
    }),
    getPartnerById: builder.query<IPartnerItem, string>({
      query: (id) => ({
        url: `${endpoints.partners}/${id}`,
        method: "GET",
      }),
    }),
    getAllPartners: builder.query<IPartnersRes[], Language>({
      query: (locale) => ({
        url: `${endpoints.partners}?locale=${locale}`,
        method: "GET",
      }),
    }),
    deletePartner: builder.mutation<void, string>({
      query: (id) => ({
        url: `${endpoints.partners}/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateWebsiteSettingMutation,
  useUpdateWebsiteSettingMutation,
  useGetWebsiteSettingDetailsQuery,
  useGetAllWebsitesQuery,
  useDeleteWebsiteMutation,
  useGetAllWebsiteListQuery,

  useCreateDmoMutation,
  useUpdateDmoMutation,
  useDeleteDmoMutation,
  useGetAllDmosQuery,
  useGetDmoByIdQuery,

  useCreateAuthorityMutation,
  useUpdateAuthorityMutation,
  useDeleteAuthorityMutation,
  useGetAuthoritiesByDmoIdQuery,
  useGetAuthorityByIdQuery,

  useCreatePartnerMutation,
  useUpdatePartnerMutation,
  useGetPartnerByIdQuery,
  useGetAllPartnersQuery,
  useDeletePartnerMutation,

  useGetAllCampaignsQuery,
} = websiteConfigApi;
