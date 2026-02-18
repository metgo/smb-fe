interface ProductPrice {
  markedPrice: number;
  sellingPrice: number;
  _id: string;
}

interface ProductQuantity {
  isUnlimited: boolean;
  remaining: number;
  sold: number;
  _id: string;
}

type ProductType =
  | "PHYSICAL"
  | "SERVICE"
  | "TABLE_ORDER"
  | "HOTEL"
  | "EXPERIENCE";
interface Product {
  _id: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;

  name: string;
  slug: string;
  productType: ProductType;

  businessId: {
    _id: string;
    name: string;
  };

  images: [
    {
      image: string;
      isPrimary: boolean;
    },
  ];
  collaboratorId: string[];

  status:
    | "draft"
    | "active"
    | "inactive"
    | "pending"
    | "approved"
    | "rejected"
    | "archived";
  impact: number;

  categories: string[];
  subCategories: string[];

  address: string | null;

  deliveryInfoSameAsBusiness: boolean;
  deliveryArea: unknown[];
  deliverySpecificSellerInfo: unknown[];
  deliveryReturnExchange: unknown[];

  isPickUpAvailable: boolean;

  activeStartDate: string;
  activeEndDate: string;

  features: unknown[];

  shortDescription: string;
  description: string;

  price: ProductPrice;
  quantity: ProductQuantity;

  // Translations
  nameAr?: string;
  nameHe?: string;
  shortDescriptionAr?: string;
  shortDescriptionHe?: string;
}
interface ProductFormData {
  // Basic Info
  businessId: string;
  name: string;
  nameAr: string;
  nameHe: string;

  shortDescription: string;
  shortDescriptionAr: string;
  shortDescriptionHe: string;

  fullDescription: string;
  fullDescriptionAr: string;
  fullDescriptionHe: string;

  // Type & Category
  type:
    | "physical"
    | "table-order"
    | "service"
    | "hotel-room"
    | "experience"
    | "";
  categories: string[];
  subCategories: string[];

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

interface IColumnVisibility {
  images: boolean;
  name: boolean;
  businessId: boolean;
  shortDescription: boolean;
  description: boolean;
  actions: boolean;
  status: boolean;
  price: boolean;
  impact: boolean;
  quantity: boolean;
  updatedAt: boolean;
}
