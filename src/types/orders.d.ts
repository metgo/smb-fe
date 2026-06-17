type TPaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "FAILURE"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";
type TOrderStatus =
  | "processing"
  | "completed"
  | "canceled"
  | "shipped"
  | "pending"
  | "draft"
  | "paid"
  | "confirmed"
  | "delivered"
  | "partially_cancelled"
  | "failed";
type TOrderType = "online" | "offline";
type TDeliveryType = "pickup" | "delivery" | "digital";

interface IOrder {
  _id: string;
  name: string;
  email: string;
  phone: string;
  productCount?: number;
  orderType: TOrderType;
  status: TOrderStatus;
  paymentStatus: TPaymentStatus;
  paymentMethod: string[];
  totalAmount: number;
  voucherAmount: number;
  creditCardAmount: number;
  vendors: string[];
  campaign: string;
  deliveryType: TDeliveryType;
  createdAt: string;
  paymentDate: string;
  products: IOrderProduct[];
  address?: string;
  campaignCode?: string;
  qrScanned: boolean;
  deliveryFee: number;
  externalApiId?: string;
}

interface IOrderProduct {
  _id: string;
  name: string;
  quantity: number;
  amount: number;
  vendor: string;
  deliveryType: "pickup" | "delivery";
  images: {
    image: string;
  };
  description: string;
  category: string;
  cancelled?: boolean;
  orderedProductId?: string;
}

class ProductDto {
  _id: string;
  name: string;
  description: string;
  image: string;
  quantity: number;
  amount: number;
  status: string;

  receiverEmail: string;
  receiverCountryCode: string;
  receiverPhone: string;
  receiverFirstName: string;
  receiverLastName: string | null;

  deliveryMethod: string;
  deliveryArea: string;
  deliveryPickupLocation: string;

  houseNo: string;
  apartment: string;
  city: string;
  street: string;

  isGift: boolean;
  additionalInfo: string;
}

class IOrdersRes {
  _id: string;
  status: TOrderStatus;
  paymentStatus: string;

  buyerEmail: string;
  buyerCountryCode: string;
  buyerPhone: string;
  buyerFirstName: string;
  buyerLastName: string | null;
  buyerAddress: string;

  paymentMode: string[];
  voucher: any[];

  totalAmount: number;
  creditCardPayment: number;
  deliveryFee: number;

  createdAt: string;
  externalApiId: string;

  products: ProductDto[];
}
