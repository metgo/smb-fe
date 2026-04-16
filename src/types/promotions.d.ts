interface IPromotion {
  id: string;
  websiteId: string;
  websiteName: string;
  placement: string;
  title: {
    en: string;
    he: string;
    ar: string;
  };
  content: {
    en: string;
    he: string;
    ar: string;
  };
  linkUrl: string;
  mediaType: "image" | "video";
  desktopMedia: {
    url: string;
  };
  mobileMedia: {
    url: string;
  };
  active: boolean;
  order: number;
  views: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface IPromotionSettings {
  websiteId: string;
  rotationType: "automatic" | "manual";
  timeInterval: number; // seconds
  placements: string[];
}
