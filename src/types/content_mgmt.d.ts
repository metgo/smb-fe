interface IContent {
  _id: string;
  name: string;
  desc: string;
  imageUrl: string;
  primaryCategory: string;
}

interface IContentGroup {
  category: string;
  isPrimary: boolean;
  isHideCategory: boolean;
  contents: IContent[];
}

interface IContentTemplate {
  topic: string;
  isHideTopic?: boolean;
  groups: IContentGroup[];
}

// -------------------- Response ---------------------

interface IContentBusiness {
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

  businessIds: IContentBusiness[];

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

  siteCategories: ISiteCategory[];

  order: number;
  isArchived: boolean;
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
