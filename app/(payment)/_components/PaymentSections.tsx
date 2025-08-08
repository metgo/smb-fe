"use client";

import OrderInfo from "./OrderInfo";
import DeliveryInfo from "./DeliveryInfo";
import PaymentInfo from "./PaymentInfo";
import ProductInfo from "./ProductInfo";

import { usePayment } from "@/hooks/usePayment";

const PaymentSections = ({ cartDetails, productDetails }: any) => {
  console.log("----cartDetails", cartDetails);
  console.log("......productDetails", productDetails);

  const {
    // handleClose,
    triggerError,
    handleToggle,
    errors,
    // setErrors,
    activeStep,
    // setActiveStep,
    // orderStatus,
    setOrderStatus,
  } = usePayment();

  return (
    <div className="flex gap-4 justify-center max-md:flex-wrap max-md:flex-col-reverse">
      <div className="flex flex-col gap-8 md:w-[60%] w-full">
        <OrderInfo
          handleToggle={handleToggle}
          firstInfo={activeStep === "first"}
          className={errors.first ? "border border-red-500 shake" : ""}
        />
        <DeliveryInfo
          setErrorType={triggerError}
          handleToggle={handleToggle}
          products={[productDetails]}
          secondInfo={activeStep === "second"}
          className={errors.second ? "border border-red-500 shake" : ""}
        />
        <PaymentInfo
          setPaymentStatus={(value: string) =>
            setOrderStatus(value as "none" | "success" | "failure")
          }
          setErrorType={triggerError}
          thirdInfo={activeStep === "third"}
          handleToggle={handleToggle}
        />
      </div>

      <ProductInfo
        className={errors.cart ? "border border-red-500 shake" : ""}
        products={[productDetails]}
      />
    </div>
  );
};

export default PaymentSections;
