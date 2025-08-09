import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { urls } from "@/lib/endpoints";
import useCheckoutStore from "@/stores/checkoutStore";
import { CODE, IdentifierId } from "@/constant/envConstants";
import { checkVoucherAmount, placeOrder } from "@/actions/paymentActions";
import { useVoucherStore } from "@/stores/voucherStore";

const errorInitialState = {
  id: -1,
  msg: "",
};

export const usePayment = () => {
  const router = useRouter();

  const { voucherDetails, createVoucher } = useVoucherStore();
  const { customerInfo, cartedProduct, orderProducts, totalDeliveryFee } =
    useCheckoutStore();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<null | string>(null);
  const [selectMethod, setSelectMethod] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "none" | "success" | "failure"
  >("none");
  const [voucherInputs, setVoucherInputs] = useState<
    { code: string; id?: string }[]
  >([{ code: "" }]);
  const [error, setError] = useState<{ id: number; msg: string } | null>(
    errorInitialState,
  );
  console.log("--------error", error);
  const [activeStep, setActiveStep] = useState<
    "first" | "second" | "third" | "product" | null
  >("first");
  const [errors, setErrors] = useState<{
    first: boolean;
    second: boolean;
    cart: boolean;
  }>({
    first: false,
    second: false,
    cart: false,
  });

  const [orderStatus, setOrderStatus] = useState<
    "none" | "success" | "failure"
  >("none");

  const handleToggle = (step: "first" | "second" | "third" | "product") => {
    setActiveStep((prev) => (prev === step ? null : step));
    setErrors({ first: false, second: false, cart: false });
  };

  const triggerError = (type: "first" | "second" | "cart" | "server") => {
    setErrors({ first: false, second: false, cart: false });
    if (type !== "server") {
      setTimeout(() => setErrors((prev) => ({ ...prev, [type]: true })), 300);
    }
  };

  function handleClose() {
    setIsPaymentModalOpen(false);
  }

  const remainingAmount =
    orderProducts?.length > 0
      ? orderProducts?.reduce((sum, item) => sum + item?.price, 0) -
        (voucherDetails?.length > 0
          ? voucherDetails?.reduce(
              (sum, item) => sum + item?.remainingAmount,
              0,
            )
          : 0) +
        totalDeliveryFee
      : 0;

  async function handelPlaceOrder() {
    const { email, phone, firstName } = customerInfo;
    setIsLoading(true);
    try {
      if (!cartedProduct.cartId) {
        triggerError("cart");
        return;
      }

      if (
        customerInfo.firstName === "" ||
        (customerInfo.phone === "" && customerInfo.email === "")
      ) {
        triggerError("first");
        return;
      }

      const placeOrderPayload = {
        email,
        firstName,
        campCode: CODE!,
        languagePreference: "he",
        identifierId: IdentifierId!,
        cartId: cartedProduct.cartId,
        voucher: voucherDetails.map((v) => ({ id: v.id })),
        ...(phone && { phone, countryCode: "972" }),
      };
      // Make API request
      const data = await placeOrder(placeOrderPayload);

      if (!data[0]?.UrlToBit) {
        setPaymentStatus("success");
      }

      if (selectMethod === "bit") {
        setPaymentUrl(data?.[0]?.UrlToBit);
      } else {
        setPaymentUrl(data?.[0]?.Url);
      }

      setIsPaymentModalOpen(true);
      setSelectMethod(null);
    } catch (error) {
      console.error("Error in handelOrders:", error);
      triggerError("server");
    } finally {
      setIsLoading(false);
    }
  }

  function handleIframeLoad(event: React.SyntheticEvent<HTMLIFrameElement>) {
    const iframe = event.currentTarget;
    const iframeWindow = iframe.contentWindow;

    // Create a flag to ensure we only process each payment result once
    let isProcessed = false;

    if (iframeWindow) {
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

          if (data?.value?.includes(urls.paymentSuccess)) {
            router.refresh();

            setTimeout(() => {
              setPaymentStatus("success");
            }, 100);
          } else if (data?.value?.includes(urls.paymentFailure)) {
            router.refresh();

            setTimeout(() => {
              setPaymentStatus("failure");
            }, 100);
          }
        }
      };

      window.addEventListener("message", messageHandler);

      return () => {
        window.removeEventListener("message", messageHandler);
      };
    }
  }

  // ------------------- Voucher Hadler ---------------------
  const addVoucherInput = () => {
    setVoucherInputs([...voucherInputs, { code: "" }]);
  };

  const isCodeDuplicate = (code: string, currentIndex: number) => {
    if (!code) return false;
    const localDuplicate = voucherInputs.some(
      (input, index) => index !== currentIndex && input.code === code,
    );
    const storeDuplicate = voucherDetails?.some(
      (voucher) => voucher.code === code,
    );
    return localDuplicate || storeDuplicate;
  };

  const handleCodeChange = (index: number, value: string) => {
    if (!cartedProduct) {
      triggerError("cart");
      return;
    }

    // Allow clearing the input even if it’s a duplicate when empty
    if (value === "" || !isCodeDuplicate(value, index)) {
      setError(null);
      const updatedInputs = [...voucherInputs];
      updatedInputs[index].code = value;
      if (value === "") {
        delete updatedInputs[index].id; // Reset id when cleared
      }
      setVoucherInputs(updatedInputs);
    } else {
      setError({ id: index, msg: `השובר ${value} כבר קיים` });

      const timer = setTimeout(() => {
        setError((prev) => (prev?.id === index ? null : prev));
      }, 2000);

      return () => clearTimeout(timer);
    }
  };

  const checkVoucher = async (index: number = 0) => {
    const code = voucherInputs[index]?.code;
    if (!code) return;

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

      const updatedInputs = [...voucherInputs];
      updatedInputs[index].id = data._id;
      setVoucherInputs(updatedInputs);

      createVoucher({
        name: data.name,
        code: data.code,
        remainingAmount: data.remainingAmount,
        id: data._id,
      });
    } catch (error) {
      console.log("Error checking voucher:", error);
      setError({ id: index, msg: "שגיאה בבדיקת השובר" });
    }
  };

  // useEffect(() => {
  //   if (voucherId !== null) {
  //     setVoucherInputs([{ code: voucherId }]);
  //     if (voucherInputs?.[0].code) checkVoucher();
  //   }
  // }, [voucherId]);

  useEffect(() => {
    if (voucherDetails.length === 0) {
      setError({ id: -1, msg: "" });
    }
  }, [voucherDetails]);

  return {
    handleClose,
    triggerError,
    handleToggle,
    errors,
    setErrors,
    activeStep,
    setActiveStep,
    orderStatus,
    setOrderStatus,
    paymentUrl,
    handleIframeLoad,
    handelPlaceOrder,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    selectMethod,
    setSelectMethod,
    paymentStatus,
    isLoading,
    setPaymentStatus,

    voucherInputs,
    addVoucherInput,
    checkVoucher,
    handleCodeChange,
    remainingAmount,
  };
};
