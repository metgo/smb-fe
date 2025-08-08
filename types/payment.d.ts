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
