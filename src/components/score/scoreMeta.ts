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

// factors grouped under the signal they feed, in signal order
export const SCORE_FACTOR_GROUPS: {
  signal: ScoreSignalKey;
  factors: ScoreFactorKey[];
}[] = [
  { signal: "sales", factors: ["momentum"] },
  { signal: "rating", factors: ["valueForMoney"] },
  {
    signal: "localImpact",
    factors: [
      "spillover",
      "tripHub",
      "eventFillRate",
      "qrCheckins",
      "tripParticipation",
      "localSourcing",
    ],
  },
  {
    signal: "reliability",
    factors: [
      "refundRate",
      "stockAccuracy",
      "vendorSetupTime",
      "chatResponse",
      "policyFlags",
    ],
  },
  { signal: "catalog", factors: ["yearRoundAvailability"] },
  {
    signal: "content",
    factors: ["socialPresence", "audienceFit", "deliveryCoverage"],
  },
  {
    signal: "engagement",
    factors: [
      "siteViews",
      "listClickThrough",
      "viewConversion",
      "multiSiteReach",
    ],
  },
  { signal: "loyalty", factors: ["giftPurchases", "newBusinessBoost"] },
];

export const SCORE_FACTOR_KEYS: ScoreFactorKey[] = SCORE_FACTOR_GROUPS.flatMap(
  (group) => group.factors,
);

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
  "inStockShare",
  "chatReplyHours",
  "activeProducts",
  "activeEvents",
  "visitors",
  "spilloverVisitors",
  "eventFillRate",
  "qrCheckins",
  "tripStops",
  "siteViews",
  "listClickThrough",
  "viewConversion",
  "sitesSoldOn",
  "sitesListedOn",
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
// rescales the rest
export const UNAVAILABLE_SIGNALS: ScoreSignalKey[] = [];
