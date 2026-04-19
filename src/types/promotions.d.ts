interface IPromotionFromData {
  externalApiId: string;

  title: {
    en: string;
    he: string;
    ar: string;
  };
  description: {
    en: string;
    he: string;
    ar: string;
  };

  placement: string;
  mediaType: string;

  mediaUrl: {
    desktop: string;
    mobile: string;
  };

  linkUrl: string;
  isActive: boolean;
}

interface IPromotionGroupFormData {
  externalApiId: string;
  placementGroup: {
    placement: string;
    rotationType: string;
    timeInterval: number;
    promotions: {
      promoId: string;
      order: number;
    }[];
  }[];
}

type TPlacement = "home_page_hero" | "sidebar" | "footer";
type TMediaType = "image" | "video";

interface IPromotionsRes {
  _id: string;
  createdAt: string;
  externalApiId: string;

  titleEn: string;
  titleHe: string;
  titleAr: string;

  descriptionEn: string;
  descriptionHe: string;
  descriptionAr: string;

  placement: Placement;
  mediaType: MediaType;

  mediaUrl: {
    desktop: string;
    mobile: string;
    _id: string;
  };

  linkUrl: string;

  isActive: boolean;
  views: number;
  clicks: number;
}

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
