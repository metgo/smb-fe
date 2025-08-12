"use client";

import { useEffect } from "react";

import { usePayment } from "@/hooks/usePayment";
import useCheckoutStore from "@/stores/checkoutStore";

import OrderInfo from "./OrderInfo";
import DeliveryInfo from "./DeliveryInfo";
import PaymentInfo from "./PaymentInfo";
import ProductInfo from "./ProductInfo";
import PaymentSuccessModal from "./PaymentSuccessModal";
import PaymentFailureModal from "./PaymentFailureModal";

const PaymentSections = ({
  cartDetails,
  productDetails,
}: {
  cartDetails: any;
  productDetails: ProductInfoProps;
}) => {
  const {
    setCartedProduct,
    setOrderProducts,
    isStepOneComplete,
    isStepTwoComplete,
  } = useCheckoutStore();

  const {
    triggerError,
    handleToggle,
    errors,
    activeStep,
    paymentStatus,
    setOrderStatus,
    error,
    isLoading,
    handelPlaceOrder,
    handleIframeLoad,
    paymentUrl,
    isPaymentModalOpen,
    setSelectMethod,
    addVoucherInput,
    checkVoucher,
    handleCodeChange,
    voucherInputs,
    remainingAmount,
    handlePaymentModalClose,
  } = usePayment();

  useEffect(() => {
    if (cartDetails) {
      setCartedProduct({
        cartId: cartDetails?._id,
        productId: cartDetails?.product?.[0]?.id,
      });
    }
  }, [cartDetails]);

  useEffect(() => {
    if (productDetails) {
      const modifiedProductDetails = {
        _id: productDetails._id,
        name: productDetails.name,
        quantity: 1,
        image: productDetails.images[0].image,
        alt: productDetails.images[0].alt,
        price: productDetails.price.sellingPrice,
        deliveryArea: productDetails.deliveryArea,
      };
      setOrderProducts([modifiedProductDetails]);
    }
  }, [productDetails]);

  return (
    <div className="flex gap-4 justify-center max-md:flex-wrap max-md:flex-col-reverse">
      <div className="flex flex-col gap-4 md:w-[60%] w-full">
        <OrderInfo
          handleToggle={handleToggle}
          firstInfo={activeStep === "first"}
          className={!isStepOneComplete ? "border border-red-500 shake" : ""}
        />
        <DeliveryInfo
          setErrorType={triggerError}
          handleToggle={handleToggle}
          secondInfo={activeStep === "second"}
          className={!isStepTwoComplete ? "border border-red-500 shake" : ""}
        />
        <PaymentInfo
          setPaymentStatus={(value: string) =>
            setOrderStatus(value as "none" | "success" | "failure")
          }
          setErrorType={triggerError}
          thirdInfo={activeStep === "third"}
          handleToggle={handleToggle}
          error={error}
          isLoading={isLoading}
          handelPlaceOrder={handelPlaceOrder}
          handleIframeLoad={handleIframeLoad}
          paymentUrl={paymentUrl}
          isPaymentModalOpen={isPaymentModalOpen}
          setSelectMethod={setSelectMethod}
          addVoucherInput={addVoucherInput}
          checkVoucher={checkVoucher}
          handleCodeChange={handleCodeChange}
          voucherInputs={voucherInputs}
          remainingAmount={remainingAmount}
          handlePaymentModalClose={handlePaymentModalClose}
        />
      </div>

      <ProductInfo
        className={errors.cart ? "border border-red-500 shake" : ""}
      />

      {paymentStatus === "success" && (
        <PaymentSuccessModal
          isOpen={paymentStatus === "success"}
          onClose={() => {}}
        />
      )}
      {paymentStatus === "failure" && (
        <PaymentFailureModal
          isOpen={paymentStatus === "failure"}
          onClose={() => {}}
        />
      )}
    </div>
  );
};

export default PaymentSections;
