declare interface ProductDetailsProps {
  _id: string;
  name: string;
  dmoId: string;
  description: string;
  shortDescription?: string;
  images: ImageItem[];
  price: Price;
  quantity: {
    _id: string;
    initila: number;
    sold: number;
    remaining: number;
    isUnlimited: boolean;
  };
  businessId: {
    _id: string;
    openingHrs: OpeningHrs[];
    deliveryArea: DeliveryArea[];
    deliverySpecificSellerInfo: string[];
    deliveryReturnExchange: string[];
    deliveryAdditionalInfo: string;
  };
  accessibilitiesId?: {
    hebrewName: string;
    name: string;
    _id: string;
  }[];
  openingHrs: OpeningHrs[];
  deliveryArea: DeliveryArea[];
  deliverySpecificSellerInfo: string[];
  deliveryReturnExchange: string[];
  deliveryAdditionalInfo: string;
}

interface ProductInfoProps {
  _id: string;
  name: string;
  images: ImageItem[];
  price: {
    markedPrice: number;
    sellingPrice: number;
  };
  quantity: {
    initial: number;
    remaining: number;
    description: string;
    isUnlimited: boolean;
  };
  businessId: productBusiness;
  description: string;
  shortDescription: string;
  deliveryArea: DeliveryArea[];
  deliverySpecificSellerInfo: string[];
  categories: categoires[];
}

interface DeliverySectionProps {
  deliveryArea: DeliveryArea[];
  deliverySpecificSellerInfo: string[];
  deliveryReturnExchange: string[];
  deliveryAdditionalInfo: string;
}
