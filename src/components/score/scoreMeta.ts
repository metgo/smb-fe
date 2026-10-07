import type {
  ScoreFactorKey,
  ScoreSignalKey,
} from "@/store/api/businessScoreApi";

// display order follows the default weights (sales 25% → loyalty 5%)
export const SCORE_SIGNAL_KEYS: ScoreSignalKey[] = [
  "sales",
  "rating",
  "localImpact",
  "reliability",
  "catalog",
  "content",
  "engagement",
  "loyalty",
];

export const SCORE_FACTOR_KEYS: ScoreFactorKey[] = [
  "momentum",
  "newBusinessBoost",
  "yearRoundAvailability",
  "spillover",
  "tripHub",
  "giftPurchases",
  "refundRate",
  "socialPresence",
  "audienceFit",
];

export const SCORE_PARAM_KEYS = [
  "halfLifeDays",
  "lookbackDays",
  "spilloverWindowDays",
  "hubWindowDays",
  "newBusinessBoost",
  "newBusinessBoostDays",
  "minRatedBusinesses",
  "ratingPrior",
  "lowSampleOrders",
  "maxGoogleRatingAgeDays",
] as const;

// metrics shown on the business score tab, in this order
export const SCORE_METRIC_KEYS = [
  "completedRevenue",
  "completedOrders",
  "googleRating",
  "googleRatingCount",
  "cancelRate",
  "avgFulfillmentDays",
  "activeProducts",
  "activeEvents",
  "visitors",
  "spilloverVisitors",
  "customers",
  "repeatCustomers",
  "completionPercent",
];

export const SIGNAL_BAR_COLOR: Record<ScoreSignalKey, string> = {
  sales: "bg-emerald-500",
  rating: "bg-amber-500",
  localImpact: "bg-orange-500",
  reliability: "bg-violet-500",
  catalog: "bg-sky-500",
  content: "bg-lime-600",
  engagement: "bg-cyan-500",
  loyalty: "bg-pink-500",
};

// signals with no backend implementation yet - the engine skips them and
// rescales the rest (engagement needs the GA4 nightly snapshot)
export const UNAVAILABLE_SIGNALS: ScoreSignalKey[] = ["engagement"];
