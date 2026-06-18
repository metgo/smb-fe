export const BUSINESS_WIZARD_TOUR_ID = "business-wizard-v1";

export const BUSINESS_WIZARD_TOUR_STEP_IDS = [
  "welcome",
  "header",
  "stepper",
  "completion",
  "content",
  "footer",
] as const;

export type BusinessWizardTourStepId =
  (typeof BUSINESS_WIZARD_TOUR_STEP_IDS)[number];
