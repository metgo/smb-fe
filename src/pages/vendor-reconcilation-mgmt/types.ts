export interface MonthlyOrder {
  _id: string;
  orderId: string;
  productName: string;
  productImage: string;
  productCategory: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purchaseDate: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  platformFee: number;
  netToVendor: number;
  status: string;
  reconciliationStatus: string;
  paymentStatus: string;
  externalApiId: string;
  paymentMethod: string;
  deliveryMethod: string;
  deliveryAddress: string;
  specialInstructions: string;
  disputeId?: string;
}
