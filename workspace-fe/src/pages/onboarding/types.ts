import type { CategorySelection } from "./categorySelection";

export interface OnboardingProduct {
  name: string;
  description: string;
  price: string;
  duration: string;
  bookingRequired: boolean;
}

export interface OnboardingAnswers {
  offer: string;
  edge: string;
  fit: string;
  practical: string;
  reco: string;
}

export type AnswerKey = keyof OnboardingAnswers;

export interface OnboardingDraft extends CategorySelection {
  step: number;
  /** Step layout the draft was saved with (see FLOW_VERSION). */
  flowVersion?: number;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  addressParts: { location: string; city: string; country: string };
  geo: { lat: string; long: string };
  website: string;
  images: TImages;
  answers: OnboardingAnswers;
  probed: Partial<Record<AnswerKey, boolean>>;
  products: OnboardingProduct[];
}

/** What the backend generator returns (see marketplace-be vendor-onboarding). */
export interface GeneratedProfile {
  /** 1-2 groups from the universal business categories taxonomy. */
  businessTypes: { category: string; subcategories: string[] }[];
  primaryCategoryId: string | null;
  categoryIds: string[];
  shortDescription: string;
  description: string;
  tags: string[];
  accessibilityIds: string[];
  groupTypeIds: string[];
  openingHours: { day: string; open: string; close: string; closed: boolean }[];
  practical: Record<string, string>;
  highlights: string[];
  socialLinks: { platform: string; url: string }[];
  products: {
    name: string;
    shortDescription: string;
    price: number | null;
    duration: string;
    bookingRequired: boolean;
  }[];
  confidenceFlags: string[];
}

export interface ResolvedAuthority {
  authorityId: string | null;
  authorityName: string | null;
  dmoId: string | null;
  method: "name" | "city" | "nearby" | "ai" | "none";
}

export const emptyDraft = (
  seed: Partial<OnboardingDraft> = {},
): OnboardingDraft => ({
  step: 0,
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  addressParts: { location: "", city: "", country: "" },
  geo: { lat: "", long: "" },
  website: "",
  images: [],
  categoryGroups: [],
  subcategories: [],
  customCategories: [],
  mainCategory: "",
  answers: { offer: "", edge: "", fit: "", practical: "", reco: "" },
  probed: {},
  products: [],
  flowVersion: 2,
  ...seed,
});
