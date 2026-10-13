import type { IInfluencerContact, IUtmForm } from "./types";

// Medium options recommended by Google Analytics for influencer / social promotion.
// https://support.google.com/analytics/answer/10917952
export const MEDIUM_OPTIONS = [
  "influencer",
  "social",
  "cpc",
  "email",
  "affiliate",
  "referral",
  "banner",
  "display",
];

// Common referral sources for influencer / social promotion. The field stays a
// free-text combobox so a specific influencer handle can also be entered.
export const SOURCE_OPTIONS = [
  "meta",
  "instagram",
  "tiktok",
  "youtube",
  "facebook",
  "twitter",
  "linkedin",
  "snapchat",
  "pinterest",
  "telegram",
  "whatsapp",
  "newsletter",
  "blog",
];

export const EMPTY_FORM: IUtmForm = {
  baseUrl: "",
  source: "meta",
  medium: "influencer",
  campaign: "",
  campaignId: "",
  term: "",
  content: "",
};

export const EMPTY_CONTACT: IInfluencerContact = {
  influencer: "",
  influencerEmail: "",
  influencerPhone: "",
};

export const UTM_PARAM_FIELDS = {
  utm_source: "source",
  utm_medium: "medium",
  utm_campaign: "campaign",
  utm_id: "campaignId",
  utm_term: "term",
  utm_content: "content",
} as const satisfies Record<string, keyof IUtmForm>;

// Website selected before opening the analytics dashboard from this page.
export const ANALYTICS_DASHBOARD_WEBSITE_ID = "689aca6896fc4dd7086c8834";
