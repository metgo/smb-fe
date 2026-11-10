// Tour steps are resolved at runtime using the active language's translation.
// Each step's title/desc are i18next keys relative to the "tour" namespace.
// Titles and descriptions are injected by the page component after calling t().

export const BUSINESS_DETAILS_TOUR_ID = "business-details-v1";

export const BUSINESS_DETAILS_TOUR_STEP_IDS = [
  "welcome",
  "status",
  "actions",
  "header",
  "stats",
  "tabs",
  "content",
] as const;

export type BusinessDetailsTourStepId =
  (typeof BUSINESS_DETAILS_TOUR_STEP_IDS)[number];
