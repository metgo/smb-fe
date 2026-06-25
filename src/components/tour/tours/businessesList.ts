export const BUSINESS_LIST_TOUR_ID = "business-list-v1";

export const BUSINESS_LIST_TOUR_STEP_IDS = [
  "welcome",
  "page-header",
  "stats",
  "search",
  "toolbar",
  "filter-panel",
  "business-list",
] as const;

export type BusinessListTourStepId =
  (typeof BUSINESS_LIST_TOUR_STEP_IDS)[number];
