type TPunchPassType = "PRODUCT" | "SERVICE" | "CLASS" | "EVENT" | "OTHER";

interface IPunchPassPayload {
  businessId: string;
  name?: string;
  description?: string;

  images: Array<IImage>;

  catalogues: {
    name?: string;
    type?: TPunchPassType;
    quantity?: number;
    dateTime?: string;
    order?: number;
  }[];

  price: {
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
    sellingPrice: number;
  };

  quantity: {
    initial: number;
    isUnlimited: boolean;
  };

  expiryDate: number;
  status: TItemStatus;
}

interface IPunchPass {
  _id: string;
  name: string;
  description: string;
  price: {
    sellingPrice: number;
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
  };
  quantity: {
    initial: number;
    sold: number;
    remaining: number;
    isUnlimited: boolean;
  };
  catelogCount: number;
  expiryDate: string;
  image: IImage;
  businessId: {
    _id: string;
    name: string;
    logo: string;
  };
  image: string;
  catalogueCount: number;
  createdAt: string;
  updatedAt: string;
}

interface IPunchPassesRes extends IPagination {
  data: Array<IPunchPass>;
}

interface IPunchPassDetailsRes extends IAuditInfo {
  _id: string;
  name: string;
  description: string;
  price: {
    sellingPrice: number;
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
  };
  quantity?: {
    initial: number;
    sold?: number;
    remaining?: number;
    isUnlimited: boolean;
  };
  expiryDate: number;
  status: TStatus;
  catalogues: {
    _id: string;
    name: string;
    dateTime?: string;
    quantity?: number;
    type: TPunchPassType;
    order?: number;
  }[];
  businessId: {
    _id: string;
    name: string;
    logo: string;
  };
  images: Array<IImage>;
}

interface IPunchPassStats {
  totalPunchPasses: number;
  approvedPunchPasses: number;
  totalSold: number;
  totalRevenue: number;
}
