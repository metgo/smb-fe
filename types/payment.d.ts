type CustomerInfoProps = {
  firstName: string;
  phone: string;
  email: string;
};

type StepType = "first" | "second" | "third" | "product";
type ErrorType = "cart" | "first" | "second" | "server";

interface OrderInfoProps {
  handleToggle: (value: StepType) => void;
  firstInfo: boolean;
  className?: string;
}

interface DeliveryInfoProps {
  secondInfo: boolean;
  handleToggle: (value: StepType) => void;
  setErrorType: (errorType: "first" | "second" | "cart") => void;
  className?: string;
}

interface PaymentInfoProps {
  thirdInfo: boolean;
  className?: string;
  handleToggle: (value: StepType) => void;
  setErrorType: (value: ErrorType) => void;
  setPaymentStatus: (value: string) => void;
  error: {
    id: number;
    msg: string;
  } | null;
  isLoading: boolean;
  handlePlaceOrder: () => void;
  handleIframeLoad: (e) => void | any;
  paymentUrl: string | null;
  isPaymentModalOpen: boolean;
  setSelectMethod: (method: string) => void;
  addVoucherInput: () => void;
  checkVoucher: () => void;
  handleCodeChange: (index: number, value: string) => void;
  voucherInputs: {
    id?: string;
    code: string;
  }[];
  remainingAmount: number;
  handlePaymentModalClose: () => void;
}

interface PaymentHookProps {
  thirdInfo: boolean;
  setErrorType: (value: ErrorType) => void;
  setPaymentStatus: (value: string) => void;
  cartId: string;
  products: CartItem[];
  cart: CartItem[];
}

// ------------------------- Voucher ----------------------
interface VoucherIdInputFieldProps {
  voucherInputs: { id?: string; code: string }[];
  error: { id: number; msg: string } | null;
  handleCodeChange: (id: number, value: any) => void;
  checkVoucher: (id: number) => void;
  addVoucherInput: () => void;
}

interface VoucherDetails {
  remainingAmount: number;
  name: string;
  code: string;
  time?: Date;
  id?: string;
}

interface VoucherDetailsState {
  voucherDetails: VoucherDetails[];
  removeVoucher: (code: string) => void;
  createVoucher: (item: VoucherDetails) => void;
  clearVoucher: () => void;
}

interface DeliveryProductsInfoProps {
  isSelected: boolean;
  _id: string;
  name: string;
  imageSrc: string;
  alt: string;
  quantity: number;
  deliveryMethod: string;
  deliveryPickupLocation: string;
  deliveryFee: number;
  activeTab: number;
  selectedDeliveryArea: string;
  isDeliveryToPointSelect: boolean;
  isDeliveryToHomeSelect: boolean;
  deliveryToHome: DeliveryArea[];
  deliveryToPoint: DeliveryArea[];
  giftReceiverInfo: {
    receiverPhone: string;
    receiverEmail: string;
    receiverMessage: string;
  };
  deliveryAddress: {
    city: string;
    street: string;
    houseNo: string;
    apartment: string;
    greeting: string;
  };
}

type CartTypeProps = {
  productId: string;
  itemType: string;
  firstName: string;
  email?: string | null;
  phone?: string | null;
  quantity: number;
  deliveryFee: number;
  deliveryMethod: string;
  deliveryPickupLocation: string;
  houseNo?: string;
  apartment?: string;
  additionalInfo?: string;
  street?: string;
  city?: string;
  isGift: boolean;
};

interface PlaceOrderProps {
  cartId: string;
  firstName: string;
  campCode: string;
  languagePreference: string;
  voucher: { id: string | undefined }[];
  identifierId: string;
  email?: string;
  phone?: string;
  cuntryCode?: string;
}

interface PaymentSuccessFailureModalProps {
  isOpen: boolean;
}

interface DeliveryProductInfo {
  _id: string;
  name: string;
  imageSrc: string;
  alt: string;
  quantity: number;
  itemType: string;
  deliveryMethod: string;
  deliveryPickupLocation: string;
  deliveryFee: number;
  activeTab: number;
  selectedDeliveryArea: string;
  isDeliveryToPointSelect: boolean;
  isDeliveryToHomeSelect: boolean;
  deliveryToHome: any[];
  deliveryToPoint: any[];
  giftReceiverInfo: {
    receiverPhone: string;
    receiverEmail: string;
    receiverMessage: string;
  };
  deliveryAddress: {
    city: string;
    street: string;
    houseNo: string;
    apartment: string;
    greeting: string;
  };
  isSelected: boolean;
}


 interface ProductRes {
  _id: string;
  name: string;
  description: string;
  businessId: {
    _id: string;
    name: string;
    address: {
      country: string;
      location: string;
      _id: string;
    };
    geoLocation: {
      lat: string;
      long: string;
      _id: string;
    };
    location: {
      type: string;
      coordinates: [number, number];
    };
    logo: {
      image: string;
      caption: string;
      alt: string;
      _id: string;
    };
    openingHrs: Array<{
      days: string;
      open: string;
      close: string;
      isHoliday: boolean;
    }>;
    isAlwaysOpen: boolean;
    slug: string;
  };
  images: Array<{
    image: string;
    isPrimary: boolean;
  }>;
  price: {
    markedPrice: number;
    discountAmount: number;
    discountPercent: number;
    sellingPrice: number;
    _id: string;
  };
  quantity: {
    sold: number;
    remaining: number | null;
    isUnlimited: boolean;
    _id: string;
  };
  categories: Array<{
    _id: string;
    name: string;
    hebrewName: string;
  }>;
  subCategories: Array<{
    _id: string;
    name: string;
    hebrewName: string;
  }>;
}