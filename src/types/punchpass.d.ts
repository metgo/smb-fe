type TPunchPassType = "ITEM" | "SERVICE" | "OTHER";

interface IPunchPassPayload {
  businessId: string;
  name?: string;
  nameHe?: string;
  nameAr?: string;
  description?: string;
  descriptionHe?: string;
  descriptionAr?: string;

  images: Array<IImage>;

  catalogues: {
    name?: string;
    nameHe?: string;
    nameAr?: string;
    type?: TPunchPassType;
    quantity?: number;
    time?: string;
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
  nameHe?: string;
  nameAr?: string;
  description: string;
  descriptionHe?: string;
  descriptionAr?: string;
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
    nameHe?: string;
    nameAr?: string;
    time?: string;
    quantity?: number;
    type: TPunchPassType;
  }[];
  businessId: {
    _id: string;
    name: string;
    logo: string;
  };
  images: Array<IImage>;
}
