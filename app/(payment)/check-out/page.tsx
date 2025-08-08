"use client";

import { usePayment } from "@/hooks/usePayment";
import { paymentPageLabels } from "@/constant/hebrew";
import {
  DeliveryInfo,
  OrderInfo,
  PaymentInfo,
  ProductInfo,
} from "../_components";

const page = () => {
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
    <div className="container mx-auto py-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-[28px] max-sm:mr-4 text-black font-extrabold">
          {paymentPageLabels.justMomentWerDone}
        </h1>

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
          />
        </div>

        {/* <PaymentSuccessModal
          onClose={handleClose}
          isOpen={orderStatus === "success"}
        />
        <PaymentFailureModal
          onClose={handleClose}
          isOpen={orderStatus === "failure"}
        /> */}
      </div>
    </div>
  );
};

export default page;
