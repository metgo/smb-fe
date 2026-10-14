import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export const punchPassesApi = createApi({
  reducerPath: "punchPassesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["PunchPasses"],

  endpoints: (builder) => ({
    createPunchPass: builder.mutation<
      IPunchPassPayload,
      { body: any; language: Language }
    >({
      query: ({ body, language }) => ({
        url: `${endpoints.punchPasses}?locale=${language}`,
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["PunchPasses"],
    }),

    updatePunchPass: builder.mutation<
      Partial<IPunchPassPayload>,
      { body: any; punchPassId: string; language: Language }
    >({
      query: ({ punchPassId, body, language }) => ({
        url: `${endpoints.punchPasses}/${punchPassId}?locale=${language}`,
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

    // Punch Pass Trends
    getPunchPassTrades: builder.query<IPunchPassTradesRes, string>({
      query: (punchPassId) => ({
        url: `${endpoints.punchPassTrades}?punchPassId=${punchPassId}`,
        method: "GET",
      }),
      providesTags: ["PunchPasses"],
    }),

    // Punch Card Redemptions
    getPunchCardRedemptions: builder.query<
      IPunchCardRedemptionsRes,
      { punchCardId: string; language: Language }
    >({
      query: ({ punchCardId, language }) => ({
        url: `${endpoints.punchCardRedemptions}?punchCardId=${punchCardId}&locale=${language}`,
        method: "GET",
      }),
      providesTags: ["PunchPasses"],
    }),

    // Punch Card Lookup
    getPunchCardLookup: builder.query<
      IPunchCardLookupRes,
      { code: string; language: Language }
    >({
      query: ({ code, language }) => ({
        url: `${endpoints.punchCardLookup}?code=${encodeURIComponent(code)}&locale=${language}`,
        method: "GET",
      }),
      providesTags: ["PunchPasses"],
    }),

    // Punch Card Redeem
    redeemPunchCard: builder.mutation<
      void,
      { punchCardId: string; payload: IPunchCardReedemPayload }
    >({
      query: ({ punchCardId, payload }) => ({
        url: `${endpoints.punchCardRedeem}?punchCardId=${punchCardId}`,
        method: "PATCH",
        data: payload,
      }),
      invalidatesTags: ["PunchPasses"],
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
  useGetPunchPassTradesQuery,

  useGetPunchCardRedemptionsQuery,

  useGetPunchCardLookupQuery,
  useRedeemPunchCardMutation,
} = punchPassesApi;
