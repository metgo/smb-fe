"use client";

import { useEffect } from "react";

import useCartStore from "@/stores/cartStore";
import useCheckoutStore from "@/stores/checkoutStore";
import { usePayment } from "@/hooks/payment/usePayment";

import OrderInfo from "./OrderInfo";
import PaymentInfo from "./PaymentInfo";
import ProductInfo from "./ProductInfo";
import DeliveryInfo from "./delivery-info";
import PaymentSuccessModal from "./PaymentSuccessModal";
import PaymentFailureModal from "./PaymentFailureModal";
import { ScreenSkeleton } from "@/components/skeletons";

const PaymentSections = () => {
  const {
    setCartedProduct,
    setOrderProducts,
    isStepOneComplete,
    isStepTwoComplete,
    placeOrderItems,
  } = useCheckoutStore();
  const { cartItems, buyNowProduct } = useCartStore();

  const {
    triggerError,
    handleToggle,
    errors,
    activeStep,
    paymentStatus,
    setOrderStatus,
    error,
    isLoading,
    isOrderPlacing,
    handlePlaceOrder,
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
    isCart,
    cartDetails,
    productDetailsList,
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
    if (Array.isArray(productDetailsList) && productDetailsList.length > 0) {
      const modifiedProductDetails = productDetailsList?.map((product) => {
        let quantity = buyNowProduct.quantity;
        let itemType = buyNowProduct.itemType;

        if (isCart && Array.isArray(placeOrderItems)) {
          const cartItem = placeOrderItems.find(
            (cart) => cart._id === product._id,
          );
          if (cartItem) {
            quantity = cartItem.quantity ?? 1;
            itemType = cartItem.itemType;
          }
        }

        return {
          _id: product._id,
          name: product.name,
          quantity,
          itemType,
          image: product?.images?.[0]?.image ?? "",
          alt: product?.images?.[0]?.alt ?? "",
          price: product?.price?.sellingPrice,
          deliveryArea: product?.deliveryArea ?? [],
        };
      });

      setOrderProducts(modifiedProductDetails);
    }
  }, [productDetailsList, isCart, cartItems]);

  return (
    <>
      <ScreenSkeleton isLoading={isLoading} />
      <div className="flex md:grid grid-cols-12 gap-4 justify-center max-md:flex-wrap max-md:flex-col-reverse">
        <div className="flex flex-col gap-4 w-full col-span-8">
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
            isLoading={isOrderPlacing}
            handlePlaceOrder={handlePlaceOrder}
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
            className={errors.cart ? "border border-red-500 shake" : ""}
          />
        </div>

        <ProductInfo />

        {paymentStatus === "success" && (
          <PaymentSuccessModal isOpen={paymentStatus === "success"} />
        )}
        {paymentStatus === "failure" && (
          <PaymentFailureModal isOpen={paymentStatus === "failure"} />
        )}
      </div>
    </>
  );
};

export default PaymentSections;
