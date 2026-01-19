interface Product {
  id: string;
  name: {
    en: string;
    he: string;
    ar: string;
  };
  shortDescription: {
    en: string;
    he: string;
    ar: string;
  };
  businessId: string;
  businessName: string;
  type: 'physical' | 'table-order' | 'service' | 'hotel-room' | 'experience';
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'archived';
  markedPrice: number;
  sellingPrice: number;
  quantity: number | null; // null = unlimited
  soldCount: number;
  availability: {
    startDate: string | null;
    endDate: string | null;
  };
  categories: string[];
  image: string | null;
  lastUpdated: string;
  languageCompleteness: {
    en: boolean;
    he: boolean;
    ar: boolean;
  };
}

interface ProductFormData {
  // Basic Info
  businessId: string;
  name: {
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

  // Type & Category
  type: 'physical' | 'table-order' | 'service' | 'hotel-room' | 'experience' | '';
  categories: string[];

  // Pricing
  markedPrice: string;
  sellingPrice: string;
  quantity: string;
  isUnlimited: boolean;
  startDate: string;
  endDate: string;

  // Media
  mainImage: string | null;
  additionalImages: string[];

  // Delivery/Service
  enableHomeDelivery: boolean;
  enableStorePickup: boolean;
  deliveryFee: string;
  deliveryTime: string;
  serviceDuration: string;
  serviceLocation: string;
}