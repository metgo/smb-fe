declare interface ProductDetailsProps {
  _id: string;
  name: string;
  dmoId: string;
  description: string;
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
    openingHrs: OpeningHrs[];
    deliveryArea: DeliveryArea[];
    deliverySpecificSellerInfo: string[];
    deliveryReturnExchange: string[];
    deliveryAdditionalInfo: string;
  };
}
