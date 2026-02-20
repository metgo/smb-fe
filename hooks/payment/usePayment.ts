"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { pathNames, urls } from "@/lib/endpoints";
import useCartStore from "@/stores/cartStore";
import useCheckoutStore from "@/stores/checkoutStore";
import { useVoucherStore } from "@/stores/voucherStore";
import { CODE, IdentifierId } from "@/constant/envConstants";
import { checkVoucherAmount, placeOrder } from "@/actions/paymentActions";
import {
  postProductToCart,
  getProductDetailsByIds,
} from "@/actions/productActions";
import { startLoading } from "@/components/wrappers/ProgressBar";
import { sendGAEvent, triggerName } from "@/lib/googleEventsConfig";

type ErrorType = Step | "cart" | "server";
type Step = "first" | "second" | "third" | "product";
type PaymentStatus = "none" | "success" | "failure";

const voucherErrorInitialState = { id: -1, msg: "" };

export const usePayment = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasFetchedRef = useRef(false);

  const isCart = searchParams.get("isCart") === "true";
  const { voucherDetails, createVoucher, clearVoucher } = useVoucherStore();
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
    placeOrderItems,
  } = useCheckoutStore();
  const { firstName, phone, email } = customerInfo;
  const { clearCart, buyNowProduct } = useCartStore();

  // ------------------- State -------------------
  const [isLoading, setIsLoading] = useState(false);
  const [isOrderPlacing, setIsOrderPlacing] = useState(false);

  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [selectMethod, setSelectMethod] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cartDetails, setCartDetails] = useState<any>(null);
  const [productDetailsList, setProductDetailsList] = useState<any[]>([]);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("none");
  const [voucherInputs, setVoucherInputs] = useState<
    { code: string; id?: string }[]
  >([{ code: "" }]);
  const [error, setError] = useState<{ id: number; msg: string } | null>(
    voucherErrorInitialState,
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

  // ------------------- Cart and Product Details  api call-------------------
  async function fetchCartDetails() {
    const cartInfo = isCart ? placeOrderItems : [buyNowProduct];
    console.log("🚀 ~ fetchCartDetails ~ buyNowProduct:", buyNowProduct);
    setIsLoading(true);
    try {
      const res = await postProductToCart(cartInfo);
      setCartDetails(res);
    } catch (error) {
      console.error("Failed to fetch cart details:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProductDetailsList() {
    const productIds = isCart
      ? placeOrderItems.map((item) => ({
          id: item._id,
          itemType: item.itemType,
        }))
      : [{ id: buyNowProduct._id, itemType: buyNowProduct.itemType }];
    if (productIds.length === 0) return;
    setIsLoading(true);
    try {
      const res = await getProductDetailsByIds(productIds);
      setProductDetailsList(res);
    } catch (error) {
      console.log("Somthing went wrong", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setIsPaymentModalOpen(false);
    setPaymentUrl(null);
    setPaymentStatus("none");

    fetchCartDetails();
    fetchProductDetailsList();
  }, []);

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

  useEffect(() => {
    setIsStepOneComplete(true);
    setIsStepTwoComplete(true);
  }, []);

  const handleClose = () => setIsPaymentModalOpen(false);

  const handlePaymentModalClose = () => {
    startLoading();
    setPaymentUrl(null);
    setIsPaymentModalOpen(false);
    router.push(pathNames.businesses);
  };
  // ------------------- Payment Flow -------------------
  const handlePlaceOrder = async () => {
    sendGAEvent(triggerName.orderPlaceBtn, {
      cartId: cartedProduct.cartId,
    });

    setIsOrderPlacing(true);

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
      if (!data[0]?.UrlToBit || data?.qrCodeUrl) {
        clearVoucher();
        clearCart();
        // setPaymentStatus("success");
        setIsPaymentModalOpen(true);
      }
      setPaymentUrl(
        selectMethod === "bit" ? data?.[0]?.UrlToBit : data?.[0]?.Url,
      );
      setSelectMethod(null);
    } catch (error) {
      console.error("Error placing order:", error);
      triggerError("server");
    } finally {
      setIsOrderPlacing(false);
    }
  };

  const handleIframeLoad = (event: React.SyntheticEvent<HTMLIFrameElement>) => {
    sendGAEvent(triggerName.orderCheckoutCardcomWindow, {
      customerAction: "Customer trigger the payment window",
    });
    const iframe = event.currentTarget;
    const iframeWindow = iframe.contentWindow;

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
        if (status === "success") {
          clearCart();
          clearVoucher();
          setIsPaymentModalOpen(false);
          sendGAEvent(triggerName.orderCheckoutCardcomSuccess, {
            customer_action: "Customer successfully completed the payment",
          });
        } else {
          sendGAEvent(triggerName.orderCheckoutCardcomFailure, {
            customer_action: "Customer failed to complete the payment",
          });
        }
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
      const timer = setTimeout(
        () => setError((prev) => (prev?.id === index ? null : prev)),
        2000,
      );

      return () => clearTimeout(timer);
    }
  };

  const checkVoucher = async (index: number = 0) => {
    const code = voucherInputs[index]?.code;
    if (isCodeDuplicate(code, index)) {
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
      setError(voucherErrorInitialState);
    }
  }, [voucherDetails]);

  return {
    isCart,
    cartDetails,
    productDetailsList,

    // UI
    activeStep,
    handleToggle,
    handleClose,
    errors,
    triggerError,
    orderStatus,
    setOrderStatus,
    isLoading,
    isOrderPlacing,
    paymentUrl,
    paymentStatus,
    setPaymentStatus,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    selectMethod,
    setSelectMethod,

    // Payment
    handlePlaceOrder,
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
