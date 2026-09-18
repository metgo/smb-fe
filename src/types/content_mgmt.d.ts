interface IContent {
  _id: string;
  name: string;
  nameHe?: string | null;
  nameAr?: string | null;
  desc: string;
  imageUrl: string;
  primaryCategory: string;
  primaryCategoryId?: {
    _id: string;
    name: string;
  };
  contentType?: "business" | "product" | "trip" | "event" | "poi";
}

interface IIcon {
  _id: string;
  name: string;
  iconPath: string;
  iconAlt: string;
}

interface IContentGroup {
  category: string;
  categoryHe?: string;
  categoryAr?: string;
  description?: string;
  descriptionHe?: string;
  descriptionAr?: string;
  isPrimary: boolean;
  isHideCategory: boolean;
  contents: IContent[];
  icon?: string | null;
  colors?: string[];
  synonyms?: string[];
  synonymsHe?: string[];
  synonymsAr?: string[];
  searchKeywords?: string[];
  searchKeywordsHe?: string[];
  searchKeywordsAr?: string[];
}

interface IContentTemplate {
  topic: string;
  topicHe?: string;
  topicAr?: string;
  description?: string;
  descriptionHe?: string;
  descriptionAr?: string;
  isPrimary?: boolean;
  isHideTopic?: boolean;
  groups: IContentGroup[];
  colors?: string[];
  icon?: string | null;
}

// -------------------- Response ---------------------

interface IContentFeedItem {
  _id: string;
  name: string;
  nameHe: string | null;
  nameAr: string | null;

  address: {
    _id: string;
    country: string;
    city: string;
    location: string;
  };

  shortDescription: string;
  description: string;

  images: {
    image: string;
    caption: string;
    alt: string;
  }[];

  primaryCategoryId: {
    _id: string;
    name: string;
    hebrewName: string;
  };
}

interface ISiteCategory {
  title: string;
  titleHe: string | null;
  titleAr: string | null;
  description: string | null;
  descriptionHe: string | null;
  descriptionAr: string | null;
  icon: string;
  colors?: string[];
  businessIds: IContentFeedItem[];
  eventIds: IContentFeedItem[];
  poiIds: IContentFeedItem[];
  tripIds: IContentFeedItem[];
  productIds: IContentFeedItem[];
  fundayIds: IContentFeedItem[];
  synonyms?: string[];
  synonymsHe?: string[];
  synonymsAr?: string[];
  searchKeywords?: string[];
  searchKeywordsHe?: string[];
  searchKeywordsAr?: string[];
  isPrimary: boolean;
  isArchived: boolean;
}

interface IContentTopic {
  title: string;
  titleHe: string | null;
  titleAr: string | null;
  description: string | null;
  descriptionHe: string | null;
  descriptionAr: string | null;
  icon?: string | null;
  colors?: string[];

  siteCategories: ISiteCategory[];

  isPrimary: boolean;
  order: number;
  isArchived: boolean;
}

// -------------------- Wizard Types ---------------------

type WizardLang = "en" | "he" | "ar";

type WizardCategory = {
  id: string;
  title: string;
  titleHe: string;
  titleAr: string;
  description: string;
  descriptionHe: string;
  descriptionAr: string;
  synonyms: string[];
  synonymsHe: string[];
  synonymsAr: string[];
  searchKeywords: string[];
  searchKeywordsHe: string[];
  searchKeywordsAr: string[];
  assignedBusinesses: any[];
  assignedProducts: any[];
  isGenerating?: boolean;
};

type WizardTopic = {
  id: string;
  title: string;
  titleHe: string;
  titleAr: string;
  description: string;
  descriptionHe: string;
  descriptionAr: string;
  categories: WizardCategory[];
};

// -------------------- View --------------------

interface IView {
  _id: string;
  viewName: string | null;
  viewNameHe: string | null;
  viewNameAr: string | null;
  themeContext?: string | null;
  isActive: boolean;
  status: "DRAFT" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
  updatedAt: string | null;
  createdAt: string;
  externalApiId: { _id: string; name: string };
  siteTopics: IContentTopic[];
}

interface IContentTemplateResponse {
  _id: string;
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  deletedBy: string | null;
  deletedAt: string | null;
  isDeleted: boolean;

  header: string;
  headerDescription: string | null;
  headerHe: string | null;
  headerDescriptionHe: string | null;
  headerAr: string | null;
  headerDescriptionAr: string | null;

  externalApiId: {
    _id: string;
    name: string;
  };

  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";

  siteTopics: IContentTopic[];

  __v: number;
}
