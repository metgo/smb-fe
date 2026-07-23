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
  // Content — EN / HE / AR
  title: string;
  titleHe: string;
  titleAr: string;
  shortDescription: string;
  shortDescriptionHe: string;
  shortDescriptionAr: string;
  content: string;
  contentHe: string;
  contentAr: string;
  // Tags
  tags: string[];
  tagsHe: string[];
  tagsAr: string[];
  // Summary
  summary: string;
  summaryHe: string;
  summaryAr: string;
  // SEO
  metaTitle: string;
  metaTitleHe: string;
  metaTitleAr: string;
  metaDescription: string;
  metaDescriptionHe: string;
  metaDescriptionAr: string;
  // Common
  status:
    | "DRAFT"
    | "PUBLISHED"
    | "SCHEDULED"
    | "ARCHIVED"
    | "APPROVED"
    | "PENDING";
}
