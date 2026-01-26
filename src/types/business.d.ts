interface Business {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  email: string;
  phone: string;
  website: string;
  logo: string;
  images: string[];
  status: "draft" | "pending" | "approved" | "rejected" | "archived";
  authority: string;
  dmo: string;
  categories: string[];
  subcategories: string[];
  tags: string[];
  impact: number;
  productsCount: number;
  lifetimeSales: number; // Total sales revenue in ILS
  address: string;
  coordinates: { lat: number; lng: number };
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
  completionPercentage: number;
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
