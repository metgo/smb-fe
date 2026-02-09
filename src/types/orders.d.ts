type TPaymentStatus =
  | "pending"
  | "success"
  | "failed"
  | "refunded"
  | "partially_refunded";
type TOrderStatus =
  | "draft"
  | "processing"
  | "paid"
  | "confirmed"
  | "delivered"
  | "completed"
  | "cancelled"
  | "partially_cancelled"
  | "failed";
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
  products: OrderProduct[];
  address?: string;
  campaignCode?: string;
  qrScanned: boolean;
  deliveryFee: number;
}

interface IOrderProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  vendor: string;
  deliveryType: "pickup" | "delivery";
  imageUrl: string;
  description: string;
  category: string;
  cancelled?: boolean;
}
