type CustomerInfoProps = {
  firstName: string;
  phone: string;
  email: string;
};

interface OrderInfoProps {
  handleToggle: (value: "first" | "second" | "third" | "product") => void;
  firstInfo: boolean;
  className?: string;
}

interface DeliveryInfoProps {
  secondInfo: boolean;
  handleToggle: (value: "first" | "second" | "third" | "product") => void;
  setErrorType: (errorType: "first" | "second" | "cart") => void;
  className?: string;
}

interface PaymentInfoProps {
  thirdInfo: boolean;
  handleToggle: (value: "first" | "second" | "third" | "product") => void;
  setErrorType: (value: "cart" | "first" | "second" | "server") => void;
  setPaymentStatus: (value: string) => void;
}

interface PaymentHookProps {
  thirdInfo: boolean;
  setErrorType: (value: "cart" | "first" | "second" | "server") => void;
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
  onClose: () => void;
}
