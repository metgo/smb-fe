interface Business {
  id: string;
  name: string;
  nameHe: string;
  nameAr: string;
  shortDescription: string;
  fullDescription: string;
  email: string;
  phone: string;
  website: string;
  logo: string;
  images: string[];
  status: TStatus;
  authority: string;
  dmo: string;
  categories: string[];
  subcategories: string[];
  tags: string[];
  impact: number;
  productsCount: number;
  lifetimeSales: number; // Total sales revenue in ILS
  address: string;
  coordinates: { lat: number; long: number };
  owner?: {
    name: string;
    email: string;
    phone: string;
  };
  contactDetails: {
    name: string;
    email: string;
    phone: string;
  };
  operatingHours: {
    [key: string]: { open: string; close: string }[];
  };
  accessibility: string[];
  groupTypes: string[];
  createdAt: string;
  updatedAt: string;
  completionPercent: number;
  internalNotes?: string;
  rejectionNote?: string;
  analytics?: {
    pageViews: number;
    uniqueVisitors: number;
    clicks: number;
    bookmarks: number;
    shares: number;
    averageTimeOnPage: number; // in seconds
    conversionRate: number; // percentage
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
  deliveryAdditionalInfo?: string;
  deliveryReturnExchange?: string[];
  deliverySpecificSellerInfo?: string[];
}

interface BusinessBasicInfoPayload {
  authority: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  internalNotes?: string;
}

interface BusinessContactPayload {
  email: string;
  phone: string;
}

interface IBusinessMedia {
  logo: IImageUpload;
  gallery: IImageUpload[];
}

interface IBusinessColumnVisibility {
  impact: boolean;
  name: boolean;
  shortDescription: boolean;
  contactDetails: boolean;
  busiEmail: boolean;
  phoneNumber: boolean;
  productCount: boolean;
  status: boolean;
  associatedWebsites: boolean;
  contactPhone: boolean;
  categories: boolean;
}

interface IBusinessesList {
  _id: string;
  createdAt: string;
  updatedAt: string;

  address: {
    country: string;
    city: string;
    location: string;
  };

  phoneNumber: string;
  busiEmail: string;
  status: TStatus;

  contactDetails: {
    name: string;
    phone: string;
    email: string;
  };

  authorityId: string;
  dmoId: string;
  slug: string;
  impact: number;

  logo: {
    image: string;
  };

  associatedWebsiteIds: string[];
  productCount: number;

  name: string;
  nameHe: string;
  nameAr: string;

  images: string[];

  shortDescription: string;
}

interface IBusinessesRes extends IPagination {
  data: Array<IBusinessesList>;
}

// Not used yet
interface IBusinessDetailsRes {
  _id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;

  name: string;
  nameHe: string;
  nameAr: string;

  address: {
    country: string;
    city: string;
    location: string;
  };

  phoneNumber: string;
  busiEmail: string;

  status: string;
  isPreview: boolean;

  contactDetails: {
    name: string;
    phone: string;
    email: string;
  };

  collabrationUser: unknown[];

  userId: {
    _id: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    role: string;
    lastLogin: string;
  };

  authorityId: string;
  dmoId: string;

  geoLocation: {
    lat: string;
    long: string;
  };

  images: {
    image: string;
    isPrimary: boolean;
  }[];

  groupTypesId: string[];
  accessibilitiesId: string[];
  primaryCategoryId: string;
  tagsId: string[];

  openingHrs: {
    day: string;
    open: string;
    close: string;
    isHoliday: boolean;
    byAppointment: boolean;
  }[];

  isAlwaysOpen: boolean;

  slug: string;

  deliveryArea: unknown[];

  deliverySpecificSellerInfo: string[];
  deliveryReturnExchange: string[];

  isPickUpAvailable: boolean;
  globalDelivery: boolean;
  vendorDelivers: boolean;

  vendorDeliveryArea: unknown[];
  globalDeliveryArea: unknown[];

  impact: number;
  completionPercent: number;

  socialMedia: unknown[];

  deliveryAdditionalInfo: string;

  description: string;
  descriptionAr: string;
  descriptionHe: string;

  internalNotes: string;

  logo: {
    image: string;
  };

  shortDescription: string;
  shortDescriptionAr: string;
  shortDescriptionHe: string;

  associatedWebsiteIds: string[];

  scoreBreakdown: {
    version: number;
    runId: string;
    computedAt: string;
    total: number;

    signals: {
      sales: number;
      loyalty: number;
      localImpact: number;
      engagement: number;
      reliability: number;
      content: number;
      catalog: number;
    };

    boost: number;
    configVersion: number;

    weights: {
      sales: number;
      loyalty: number;
      localImpact: number;
      engagement: number;
      reliability: number;
      content: number;
      catalog: number;
    };

    metrics: {
      eventFillRate: number | null;
      eventShowRate: number | null;
      qrCheckins: number | null;
      tripStops: number | null;
      localSourcing: number | null;

      pickupOrders: number;
      deliveryOrders: number;
      attendedTickets: number;

      pickupShare: number;

      visitors: number;
      spilloverVisitors: number;
      tripHub: number;

      sitesSoldOn: number;
      sitesListedOn: number;

      siteViews: number | null;
      viewsPercentile: number | null;
      listImpressions: number | null;
      listClickThrough: number | null;
      viewConversion: number | null;
      inStockShare: number | null;

      setupDays: number | null;

      chatReplyHours: number;

      policyWarnings: number;
      suspended: number;

      scoredLines: number;
      canceledOrders: number;
      refundedOrders: number;

      cancelRate: number;

      avgFulfillmentDays: number | null;

      imageScore: number;
      completionPercent: number;

      languageCoverage: number;
      deliveryOptions: number;
      deliveryAreas: number;
      socialLinks: number;

      audienceFit: number;

      activeProducts: number;
      activeEvents: number;
      availability: number;
    };

    flags: string[];

    suggestions: {
      key: string;
      signal: string;
      points: number;
      params?: {
        count?: number;
        percent?: number;
      };
    }[];
  };

  discountBoxes: string[];
  discountConfigType: string;
  providesDiscount: boolean;
  bankDetailsFilled: boolean;
}
