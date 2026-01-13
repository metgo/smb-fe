interface Order {
  id: string;
  purchaserName: string;
  email: string;
  phone: string;
  orderType: 'online' | 'offline';
  orderStatus: 'draft' | 'processing' | 'paid' | 'confirmed' | 'delivered' | 'completed' | 'cancelled' | 'partially_cancelled' | 'failed';
  paymentStatus: 'pending' | 'success' | 'failed' | 'refunded' | 'partially_refunded';
  paymentMethod: string[];
  totalAmount: number;
  voucherAmount: number;
  creditCardAmount: number;
  vendors: string[];
  campaign: string;
  deliveryType: 'pickup' | 'delivery' | 'digital';
  createdDate: string;
  paymentDate: string;
  products: OrderProduct[];
  address?: string;
  campaignCode?: string;
  qrScanned: boolean;
  deliveryFee: number;
}

interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  vendor: string;
  deliveryType: 'pickup' | 'delivery';
  imageUrl: string;
  description: string;
  category: string;
  cancelled?: boolean;
}