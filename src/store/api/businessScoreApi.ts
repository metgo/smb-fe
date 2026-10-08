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
  | "audienceFit"
  | "deliveryCoverage"
  | "valueForMoney"
  | "stockAccuracy"
  | "vendorSetupTime"
  | "policyFlags"
  | "localSourcing"
  | "chatResponse"
  | "eventFillRate"
  | "qrCheckins"
  | "tripParticipation"
  | "multiSiteReach"
  | "siteViews"
  | "listClickThrough"
  | "viewConversion";

export type ScoreRunMode = "automatic" | "manual";
export type ScoreFrequency = "hourly" | "daily" | "weekly";
export type ScheduleState = "active" | "manual" | "notStarted" | "ended";

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
  // owner's to-do list, biggest estimated gain first (missing on scores
  // calculated before suggestions existed)
  suggestions?: IScoreSuggestion[];
}

export interface IScoreSuggestion {
  key: string;
  signal: ScoreSignalKey;
  // rough score points (out of 800) the action could add
  points: number;
  params?: Record<string, number | string>;
}

export interface IPolicyFlag {
  _id: string;
  type: "WARNING" | "SUSPENSION";
  reason: string;
  createdBy: string | null;
  createdAt: string;
  resolvedBy: string | null;
  resolvedAt: string | null;
}

export interface ILocalSourcing {
  localProductsPercent: number | null;
  localEmployees: number | null;
  verifiedBy: string | null;
  verifiedAt: string | null;
}

// admin inputs that feed the score
export interface IScoreInputs {
  policyFlags: IPolicyFlag[];
  localSourcing: ILocalSourcing | null;
}

export interface IBusinessScore extends IScoreInputs {
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

export interface IScoreSchedule {
  mode: ScoreRunMode;
  frequency: ScoreFrequency;
  everyHours: number;
  // HH:mm, Israel time
  time: string;
  // 0 = Sunday
  dayOfWeek: number;
  // YYYY-MM-DD, inclusive; null = open-ended
  startDate: string | null;
  endDate: string | null;
}

export interface IScoreRun {
  runId: string;
  trigger: "schedule" | "manual" | "business" | "script";
  triggeredBy: string | null;
  scheduleSlot: string | null;
  startedAt: string;
  durationMs: number;
  scored: number;
  reset: number;
  skipped: string | null;
  error: string | null;
  liveSignals: string[];
  configVersion: number | null;
  businessIds: string[];
}

export interface IAnalyticsImportResult {
  externalApiId: string;
  site: string;
  // null = the site has no GA4 property ID in site config
  propertyId: string | null;
  rows: number;
  error: string | null;
}

export interface IScoreConfig {
  version: number;
  schedule: IScoreSchedule;
  signals: Record<ScoreSignalKey, { enabled: boolean; weight: number }>;
  factors: Record<ScoreFactorKey, boolean>;
  params: Record<string, number | string | null>;
  paramsEnabled: Record<string, boolean>;
  updatedAt: string | null;
  updatedBy: string | null;
  status: {
    state: ScheduleState;
    // "YYYY-MM-DDTHH:mm" in timeZone
    nextRun: string | null;
    timeZone: string;
    lastRun: IScoreRun | null;
  };
}

export interface IUpdateScoreConfig {
  schedule?: Partial<IScoreSchedule>;
  signals?: Partial<
    Record<ScoreSignalKey, { enabled?: boolean; weight?: number }>
  >;
  factors?: Partial<Record<ScoreFactorKey, boolean>>;
  params?: Record<string, number | string | null>;
  paramsEnabled?: Record<string, boolean>;
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
  tagTypes: ["BusinessScore", "ScoreConfig", "ScoreRuns"],
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

    recalculateScores: builder.mutation<
      IScoreRunSummary,
      { dryRun?: boolean; config?: IUpdateScoreConfig }
    >({
      query: ({ dryRun, config }) => ({
        url: endpoints.businessRecalculateImpact,
        method: "POST",
        params: { dryRun: dryRun ? "true" : undefined },
        // unsaved settings - the server only uses them for previews
        data: dryRun && config ? { config } : {},
      }),
      // a real run changes every score shown in Workspace
      invalidatesTags: (_result, _error, { dryRun }) =>
        dryRun ? [] : ["BusinessScore", "ScoreRuns", "ScoreConfig"],
    }),

    recalculateBusinessScore: builder.mutation<
      IBusinessScore,
      { businessId: string }
    >({
      query: ({ businessId }) => ({
        url: `${endpoints.business}/${businessId}/recalculate-score`,
        method: "POST",
      }),
      invalidatesTags: ["BusinessScore", "ScoreRuns"],
    }),

    addPolicyFlag: builder.mutation<
      IScoreInputs,
      { businessId: string; type: IPolicyFlag["type"]; reason: string }
    >({
      query: ({ businessId, ...data }) => ({
        url: `${endpoints.business}/${businessId}/policy-flags`,
        method: "POST",
        data,
      }),
      invalidatesTags: ["BusinessScore"],
    }),

    resolvePolicyFlag: builder.mutation<
      IScoreInputs,
      { businessId: string; flagId: string }
    >({
      query: ({ businessId, flagId }) => ({
        url: `${endpoints.business}/${businessId}/policy-flags/${flagId}/resolve`,
        method: "PATCH",
      }),
      invalidatesTags: ["BusinessScore"],
    }),

    updateLocalSourcing: builder.mutation<
      IScoreInputs,
      {
        businessId: string;
        localProductsPercent: number | null;
        localEmployees: number | null;
      }
    >({
      query: ({ businessId, ...data }) => ({
        url: `${endpoints.business}/${businessId}/local-sourcing`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: ["BusinessScore"],
    }),

    verifyLocalSourcing: builder.mutation<
      IScoreInputs,
      { businessId: string; verified: boolean }
    >({
      query: ({ businessId, verified }) => ({
        url: `${endpoints.business}/${businessId}/local-sourcing/verify`,
        method: "PATCH",
        data: { verified },
      }),
      invalidatesTags: ["BusinessScore"],
    }),

    importAnalytics: builder.mutation<
      IAnalyticsImportResult[],
      { days?: number }
    >({
      query: ({ days }) => ({
        url: endpoints.businessScoreAnalyticsImport,
        method: "POST",
        params: { days },
      }),
    }),

    getScoreRuns: builder.query<IScoreRun[], { limit?: number }>({
      query: ({ limit }) => ({
        url: endpoints.businessScoreRuns,
        method: "GET",
        params: { limit },
      }),
      providesTags: ["ScoreRuns"],
    }),
  }),
});

export const {
  useGetBusinessScoreQuery,
  useGetBusinessScoreHistoryQuery,
  useGetScoreConfigQuery,
  useUpdateScoreConfigMutation,
  useRecalculateScoresMutation,
  useRecalculateBusinessScoreMutation,
  useGetScoreRunsQuery,
  useImportAnalyticsMutation,
  useAddPolicyFlagMutation,
  useResolvePolicyFlagMutation,
  useUpdateLocalSourcingMutation,
  useVerifyLocalSourcingMutation,
} = businessScoreApi;
