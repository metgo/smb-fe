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
