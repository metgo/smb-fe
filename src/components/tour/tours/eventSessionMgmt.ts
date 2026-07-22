export const EVENT_SESSION_TOUR_ID = "event-session-v1";

export const EVENT_SESSION_TOUR_STEP_IDS = [
  "welcome",
  "page-header",
  "tabs-nav",
  "landing",
  "capacity",
  "analytics",
  "notify",
  "regs",
] as const;

export type EventSessionTourStepId =
  (typeof EVENT_SESSION_TOUR_STEP_IDS)[number];
