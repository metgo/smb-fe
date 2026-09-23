import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const punchPassesApi = createApi({
  reducerPath: "punchPassesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["PunchPasses"],

  endpoints: (builder) => ({
    createPunchPass: builder.mutation<IPunchPassPayload, any>({
      query: (body) => ({
        url: endpoints.punchPasses,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["PunchPasses"],
    }),

    updatePunchPass: builder.mutation<Partial<IPunchPassPayload>, any>({
      query: ({ punchPassId, body }) => ({
        url: `${endpoints.punchPasses}/${punchPassId}`,
        method: "PATCH",
        data: body,
      }),
      invalidatesTags: ["PunchPasses"],
    }),

    deletePunchPass: builder.mutation<void, string>({
      query: (punchPassId) => ({
        url: `${endpoints.punchPasses}/${punchPassId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PunchPasses"],
    }),

    getPunchPasses: builder.query<IPunchPassesRes, any>({
      query: (params) => ({
        url: endpoints.punchPasses,
        method: "GET",
        params,
      }),
      providesTags: ["PunchPasses"],
    }),

    getPunchPassById: builder.query<
      IPunchPassDetailsRes,
      { punchPassId: string; language: Language }
    >({
      query: ({ punchPassId, language }) => ({
        url: `${endpoints.punchPasses}/${punchPassId}?locale=${language}`,
        method: "GET",
      }),
      providesTags: ["PunchPasses"],
    }),

    getPunchPassStats: builder.query<IPunchPassStats, void>({
      query: () => ({
        url: endpoints.punchPassStats,
        method: "GET",
      }),
      providesTags: ["PunchPasses"],
    }),
  }),
});

export const {
  useCreatePunchPassMutation,
  useUpdatePunchPassMutation,
  useDeletePunchPassMutation,
  useGetPunchPassByIdQuery,
  useLazyGetPunchPassByIdQuery,
  useGetPunchPassesQuery,

  useGetPunchPassStatsQuery,
} = punchPassesApi;
