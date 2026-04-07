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