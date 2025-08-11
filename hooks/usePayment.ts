import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { urls } from "@/lib/endpoints";
import useCheckoutStore from "@/stores/checkoutStore";
import { CODE, IdentifierId } from "@/constant/envConstants";
import { checkVoucherAmount, placeOrder } from "@/actions/paymentActions";
import { useVoucherStore } from "@/stores/voucherStore";

type Step = "first" | "second" | "third" | "product";
type PaymentStatus = "none" | "success" | "failure";
type ErrorType = Step | "cart" | "server";

const errorInitialState = { id: -1, msg: "" };

export const usePayment = () => {
  const router = useRouter();
  const { voucherDetails, createVoucher } = useVoucherStore();
  const {
    customerInfo,
    cartedProduct,
    orderProducts,
    totalDeliveryFee,
    setIsStepOneComplete,
    setIsStepTwoComplete,
    isStepOneComplete,
    isStepTwoComplete,
    isStepOneSubmitBtnDisabled,
    isStepTwoSubmitBtnDisabled,
  } = useCheckoutStore();
  const { firstName, phone, email } = customerInfo;

  // ------------------- State -------------------
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [selectMethod, setSelectMethod] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("none");
  const [voucherInputs, setVoucherInputs] = useState<
    { code: string; id?: string }[]
  >([{ code: "" }]);
  const [error, setError] = useState<{ id: number; msg: string } | null>(
    errorInitialState,
  );
  const [activeStep, setActiveStep] = useState<Step | null>("first");
  const [errors, setErrors] = useState<{
    first: boolean;
    second: boolean;
    cart: boolean;
  }>({
    first: false,
    second: false,
    cart: false,
  });
  const [orderStatus, setOrderStatus] = useState<PaymentStatus>("none");

  // ------------------- Helpers -------------------
  const resetErrors = () =>
    setErrors({ first: false, second: false, cart: false });

  const triggerError = (type: ErrorType) => {
    resetErrors();
    if (type !== "server") {
      setTimeout(() => setErrors((prev) => ({ ...prev, [type]: true })), 300);
    }
  };

  const calculateRemainingAmount = () => {
    if (!orderProducts?.length) return 0;
    const productsTotal = orderProducts.reduce(
      (sum, item) => sum + item.price,
      0,
    );
    const vouchersTotal = voucherDetails.reduce(
      (sum, item) => sum + item.remainingAmount,
      0,
    );
    return productsTotal - vouchersTotal + totalDeliveryFee;
  };

  const isCustomerInfoValid = () => {
    return firstName && (phone || email);
  };

  // ------------------- Step UI -------------------
  const handleToggle = (step: Step) => {
    setActiveStep((prev) => (prev === step ? null : step));
    if (step === "second") {
      setIsStepOneComplete(isStepOneSubmitBtnDisabled ? false : true);
    }
    if (step === "third") {
      setIsStepOneComplete(isStepOneSubmitBtnDisabled ? false : true);
      setIsStepTwoComplete(isStepTwoSubmitBtnDisabled ? false : true);
    }
    resetErrors();
  };

  const handleClose = () => setIsPaymentModalOpen(false);

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setPaymentUrl(null);
  };
  // ------------------- Payment Flow -------------------
  const handelPlaceOrder = async () => {
    setIsLoading(true);

    try {
      if (!cartedProduct.cartId) {
        triggerError("cart");
        return;
      }
      if (!isCustomerInfoValid()) {
        triggerError("first");
        return;
      }

      const payload = {
        firstName: customerInfo.firstName,
        campCode: CODE!,
        languagePreference: "he",
        identifierId: IdentifierId!,
        cartId: cartedProduct.cartId,
        voucher: voucherDetails.map((v) => ({ id: v.id })),
        ...(customerInfo.phone && {
          phone: customerInfo.phone,
          countryCode: "972",
        }),
        ...(email && { email }),
      };

      const data = await placeOrder(payload);

      if (!data[0]?.UrlToBit) {
        setPaymentStatus("success");
      }

      setPaymentUrl(
        selectMethod === "bit" ? data?.[0]?.UrlToBit : data?.[0]?.Url,
      );
      setIsPaymentModalOpen(true);
      setSelectMethod(null);
    } catch (error) {
      console.error("Error placing order:", error);
      triggerError("server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframeWindow = event.currentTarget.contentWindow;
    let isProcessed = false;

    if (!iframeWindow) return;

    const messageHandler = (event: MessageEvent) => {
      const { data } = event;
      if (isProcessed) return;

      if (
        data?.value?.includes(urls.paymentSuccess) ||
        data?.value?.includes(urls.paymentFailure)
      ) {
        isProcessed = true;
        window.removeEventListener("message", messageHandler);
        setIsPaymentModalOpen(false);
        setPaymentUrl(null);

        const status = data?.value?.includes(urls.paymentSuccess)
          ? "success"
          : "failure";
        router.refresh();
        setTimeout(() => setPaymentStatus(status), 100);
      }
    };

    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  };

  // ------------------- Voucher Logic -------------------
  const addVoucherInput = () =>
    setVoucherInputs((prev) => [...prev, { code: "" }]);

  const isCodeDuplicate = (code: string, index: number) => {
    if (!code) return false;
    const localDup = voucherInputs.some(
      (v, i) => i !== index && v.code === code,
    );
    const storeDup = voucherDetails.some((v) => v.code === code);
    return localDup || storeDup;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!cartedProduct) {
      triggerError("cart");
      return;
    }
    if (value === "" || !isCodeDuplicate(value, index)) {
      setError(null);
      setVoucherInputs((prev) => {
        const updated = [...prev];
        updated[index].code = value;
        if (value === "") delete updated[index].id;
        return updated;
      });
    } else {
      setError({ id: index, msg: `השובר ${value} כבר קיים` });
      setTimeout(
        () => setError((prev) => (prev?.id === index ? null : prev)),
        2000,
      );
    }
  };

  const checkVoucher = async (index: number = 0) => {
    const code = voucherInputs[index]?.code;
    if (!code || isCodeDuplicate(code, index)) {
      setError({ id: index, msg: `השובר ${code} כבר קיים` });
      return;
    }

    try {
      const data = await checkVoucherAmount(code, cartedProduct.productId);
      if (data.error) {
        setError({ id: index, msg: `השובר לא נמצא` });
        return;
      }
      setVoucherInputs((prev) => {
        const updated = [...prev];
        updated[index].id = data._id;
        return updated;
      });
      createVoucher({
        name: data.name,
        code: data.code,
        remainingAmount: data.remainingAmount,
        id: data._id,
      });
    } catch (error) {
      console.error("Error checking voucher:", error);
      setError({ id: index, msg: "שגיאה בבדיקת השובר" });
    }
  };

  useEffect(() => {
    if (voucherDetails.length === 0) {
      setError(errorInitialState);
    }
  }, [voucherDetails]);

  return {
    // UI
    activeStep,
    handleToggle,
    handleClose,
    errors,
    triggerError,
    orderStatus,
    setOrderStatus,
    isLoading,
    paymentUrl,
    paymentStatus,
    setPaymentStatus,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    selectMethod,
    setSelectMethod,

    // Payment
    handelPlaceOrder,
    handleIframeLoad,
    handlePaymentModalClose,
    remainingAmount: calculateRemainingAmount(),

    // Voucher
    voucherInputs,
    addVoucherInput,
    checkVoucher,
    handleCodeChange,
    error,

    // Step completion
    setIsStepOneComplete,
    setIsStepTwoComplete,
    isStepOneComplete,
    isStepTwoComplete,
  };
};
