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

class IProductDto {
  _id: string;
  orderedProductId: string;
  name: string;
  description: string;
  image: string;
  quantity: number;
  amount: number;
  status: string;
  itemType: "PRODUCT" | "TICKET";

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

  cancelled: {
    _id: string;
    additionalInfo: string;
    canceledDate: string;
    canceledReson: string;
    email: string; //canceledBy Admin email
    name: string; //canceledBy Admin name
  };

  business?: {
    _id: string;
    nameEn: string;
    nameHe: string;
    nameAr: string;
    logoUrl: string;
  };
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

  products: IProductDto[];
}

interface IOrderColumnVisibility {
  name: boolean;
  email: boolean;
  phone: boolean;
  status: boolean;
  paymentStatus: boolean;
  paymentMethod: boolean;
  totalOrderAmount: boolean;
  productCount: boolean;
  deliveryFee: boolean;
  createdAt: boolean;
  _id: boolean;
  website: boolean;
  dmos: boolean;
  authorities: boolean;
}

interface IOrderSummaryColumnVisibility {
  businessName: boolean;
  businessAddressCity: boolean;
  businessAddressLocation: boolean;
  totalNoOfOrders: boolean;
  totalAmount: boolean;
  totalAmountPaidByCreditCard: boolean;
}

// -------------------- Offline Orders ---------------------
interface IOfflineOrder {
  _id: string;
  companyName: string;
  employerType: string;
  leadDate: string;
  initialRequest: number;
  closedDealValue: number;
  dealClosureDate: string;
  vendor: string;
  product: string;
  paymentMethod: string;
  description: string;
  name: string;
  productPrice: number;
  desiredQuantity: number;
  phone: string;
  email: string;
  createdAt: string;
  position: string;
  updatedAt: string;
}

interface IOfflineOrdersRes extends IPagination {
  data: Array<IOfflineOrder>;
}
