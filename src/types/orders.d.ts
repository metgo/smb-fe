type TPaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";
type TOrderStatus =
  | "processing"
  | "completed"
  | "canceled"
  | "shipped"
  | "pending";
type TOrderType = "online" | "offline";
type TDeliveryType = "pickup" | "delivery" | "digital";

interface IOrder {
  _id: string;
  firstName: string;
  email: string;
  phone: string;
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
  products: OrderProduct;
  address?: string;
  campaignCode?: string;
  qrScanned: boolean;
  deliveryFee: number;
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
