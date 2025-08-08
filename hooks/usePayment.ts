import { useRouter } from "next/navigation";
import { useState } from "react";

export const usePayment = () => {
  const router = useRouter();

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

  const handleClose = () => {
    router.replace("/product");
  };

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
  };
};
