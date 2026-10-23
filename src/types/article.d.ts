interface Article {
  id: string;
  websiteId: string;
  websiteName: string;
  title: {
    en: string;
    he: string;
    ar: string;
  };
  shortDescription: {
    en: string;
    he: string;
    ar: string;
  };
  fullDescription: {
    en: string;
    he: string;
    ar: string;
  };
  slug: string;
  status: "draft" | "published" | "scheduled" | "archived";
  tags: string[];
  primaryMedia: string;
  author: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  shares: number;
}

interface IArticleImage {
  image: string;
  alt: string;
  isPrimary: boolean;
}

interface IArticleFormData {
  externalApiId:
    | {
        id: string;
        name: string;
        logo: string;
        url: string;
      }
    | string;
  // Content
  title: string;
  shortDescription: string;
  content: string;
  // Tags
  tags: string[];
  // Summary
  summary: string;
  // SEO
  metaTitle: string;
  metaDescription: string;
  // Common
  status:
    "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED" | "APPROVED" | "PENDING";
}

interface IBlogDetails {
  _id: string;
  status: string;
  title: string;
  shortDescription: string;
  content: string;
  summary: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  tags: string[];
  tagsHe: string[];
  tagsAr: string[];
  images: BlogImage[];
  createdAt: string;
  updatedAt: string | null;
  createdBy: string;
  updatedBy: string | null;
  externalApiId: {
    id: string;
    name: string;
    logo: string;
    url: string;
  };
}
