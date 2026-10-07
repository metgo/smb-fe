import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";
import { endpoints } from "@/lib/endpoints";

export type ScoreSignalKey =
  | "sales"
  | "rating"
  | "localImpact"
  | "reliability"
  | "catalog"
  | "content"
  | "engagement"
  | "loyalty";

export type ScoreFactorKey =
  | "momentum"
  | "newBusinessBoost"
  | "yearRoundAvailability"
  | "spillover"
  | "tripHub"
  | "giftPurchases"
  | "refundRate"
  | "socialPresence"
  | "audienceFit";

export interface IScoreBreakdown {
  version: number;
  runId: string;
  computedAt: string;
  // 0–100 blended score before mapping to 200–800
  total: number;
  // 0–100 per live signal
  signals: Partial<Record<ScoreSignalKey, number>>;
  boost: number;
  configVersion: number;
  // effective (rescaled) weight per live signal, sums to 1
  weights: Partial<Record<ScoreSignalKey, number>>;
  metrics: Record<string, number | null>;
  flags: string[];
}

export interface IBusinessScore {
  businessId: string;
  status: string;
  impact: number;
  breakdown: IScoreBreakdown | null;
}

export interface IScoreHistoryPoint {
  impact: number;
  signals: Partial<Record<ScoreSignalKey, number>>;
  computedAt: string;
  configVersion: number;
  runId: string;
}

export interface IScoreConfig {
  enabled: boolean;
  version: number;
  signals: Record<ScoreSignalKey, { enabled: boolean; weight: number }>;
  factors: Record<ScoreFactorKey, boolean>;
  params: Record<string, number | string | null>;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface IUpdateScoreConfig {
  enabled?: boolean;
  signals?: Partial<
    Record<ScoreSignalKey, { enabled?: boolean; weight?: number }>
  >;
  factors?: Partial<Record<ScoreFactorKey, boolean>>;
  params?: Record<string, number | string | null>;
}

export interface IScoreRunSummary {
  runId: string;
  dryRun: boolean;
  skipped?: string;
  configVersion: number;
  liveSignals: ScoreSignalKey[];
  skippedSignals: { key: ScoreSignalKey; reason: string }[];
  effectiveWeights: Partial<Record<ScoreSignalKey, number>>;
  scored: number;
  reset: number;
  distribution: {
    min: number;
    median: number;
    max: number;
    average: number;
  } | null;
  preview: {
    businessId: string;
    impact: number;
    previousImpact: number;
    signals: Partial<Record<ScoreSignalKey, number>>;
  }[];
  durationMs: number;
}

export const businessScoreApi = createApi({
  reducerPath: "businessScoreApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["BusinessScore", "ScoreConfig"],
  endpoints: (builder) => ({
    getBusinessScore: builder.query<IBusinessScore, { businessId: string }>({
      query: ({ businessId }) => ({
        url: `${endpoints.business}/${businessId}/score`,
        method: "GET",
      }),
      providesTags: ["BusinessScore"],
    }),

    getBusinessScoreHistory: builder.query<
      IScoreHistoryPoint[],
      { businessId: string; limit?: number }
    >({
      query: ({ businessId, limit }) => ({
        url: `${endpoints.business}/${businessId}/score-history`,
        method: "GET",
        params: { limit },
      }),
      providesTags: ["BusinessScore"],
    }),

    getScoreConfig: builder.query<IScoreConfig, void>({
      query: () => ({ url: endpoints.businessScoreConfig, method: "GET" }),
      providesTags: ["ScoreConfig"],
    }),

    updateScoreConfig: builder.mutation<IScoreConfig, IUpdateScoreConfig>({
      query: (data) => ({
        url: endpoints.businessScoreConfig,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["ScoreConfig"],
    }),

    recalculateScores: builder.mutation<IScoreRunSummary, { dryRun?: boolean }>(
      {
        query: ({ dryRun }) => ({
          url: endpoints.businessRecalculateImpact,
          method: "POST",
          params: { dryRun: dryRun ? "true" : undefined },
        }),
        // a real run changes every score shown in Workspace
        invalidatesTags: (_result, _error, { dryRun }) =>
          dryRun ? [] : ["BusinessScore"],
      },
    ),
  }),
});

export const {
  useGetBusinessScoreQuery,
  useGetBusinessScoreHistoryQuery,
  useGetScoreConfigQuery,
  useUpdateScoreConfigMutation,
  useRecalculateScoresMutation,
} = businessScoreApi;
