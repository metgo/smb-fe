import { createApi } from "@reduxjs/toolkit/query/react";

import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";


export const websiteConfigApi = createApi({
  reducerPath: "websiteConfigApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["WebsiteConfig"],

  endpoints: (builder) => ({
    //  ============== DMOs Config ==============
    // Mutations
    createDmo: builder.mutation<any, TDmoReqPayload>({
      query: (body) => ({
        url: endpoints.dmos,
        method: "POST",
        data: body
      })
    }),
    updateDmo: builder.mutation<any, { id: string, body: Partial<TDmoReqPayload> }>({
      query: ({ id, body }) => ({
        url: `${endpoints.dmos}/${id}`,
        method: "PATCH",
        data: body
      })
    }),
    deleteDmo: builder.mutation<any, string>({
      query: (id) => ({
        url: `${endpoints.dmos}/${id}`,
        method: "DELETE",
      })
    }),

    // Queries
    getAllDmos: builder.query<IDmoRes[], void>({
      query: () => ({
        url: endpoints.dmos,
        method: "GET",
      })
    }),

    getDmoById: builder.query<TDmoEditData, string>({
      query: (id) => ({
        url: `${endpoints.dmos}/${id}`,
        method: "GET",
      })
    }),

    //  ============== Authorities Config ==============
    // Mutations
    createAuthority: builder.mutation<any, IAuthorityReqPayload>({
      query: (body) => ({
        url: endpoints.authorities,
        method: "POST",
        data: body
      })
    }),
    updateAuthority: builder.mutation<any, { id: string, body: Partial<IAuthorityReqPayload> }>({
      query: ({ id, body }) => ({
        url: `${endpoints.authorities}/${id}`,
        method: "PATCH",
        data: body
      })
    }),
    deleteAuthority: builder.mutation<any, string>({
      query: (id) => ({
        url: `${endpoints.authorities}/${id}`,
        method: "DELETE",
      })
    }),

    // Queries
    getAuthoritiesByDmoId: builder.query<IAuthorityRes[], string>({
      query: (dmoId) => ({
        url: `${endpoints.authorities}/by-dmo-id/${dmoId}`,
        method: "GET",
      })
    }),

    getAuthorityById: builder.query<any, string>({
      query: (id) => ({
        url: `${endpoints.authorities}/${id}`,
        method: "GET",
      })
    }),
  })
})

export const {
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
} = websiteConfigApi