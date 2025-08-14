"use client";

import { useEffect } from "react";

import { usePayment } from "@/hooks/usePayment";
import useCheckoutStore from "@/stores/checkoutStore";

import OrderInfo from "./OrderInfo";
import PaymentInfo from "./PaymentInfo";
import ProductInfo from "./ProductInfo";
import PaymentSuccessModal from "./PaymentSuccessModal";
import PaymentFailureModal from "./PaymentFailureModal";
import useCartStore from "@/stores/cartStore";
import DeliveryInfo from "./delivery-info";

const PaymentSections = ({
  isCart,
  cartDetails,
  productDetailsList,
}: {
  isCart: boolean;
  cartDetails: any;
  productDetailsList: ProductInfoProps[];
}) => {
  const {
    setCartedProduct,
    setOrderProducts,
    isStepOneComplete,
    isStepTwoComplete,
  } = useCheckoutStore();
  const { cartProducts } = useCartStore();

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
    if (Array.isArray(productDetailsList) && productDetailsList.length > 0) {
      const modifiedProductDetails = productDetailsList.map((product) => {
        let quantity = 1;

        if (isCart && Array.isArray(cartProducts)) {
          const cartItem = cartProducts.find(
            (cart) => cart._id === product._id,
          );
          if (cartItem) {
            quantity = cartItem.quantity ?? 1;
          }
        }

        return {
          _id: product._id,
          name: product.name,
          quantity,
          image: product?.images?.[0]?.image ?? "",
          alt: product?.images?.[0]?.alt ?? "",
          price: product?.price?.sellingPrice,
          deliveryArea: product?.deliveryArea,
        };
      });

      setOrderProducts(modifiedProductDetails);
    }
  }, [productDetailsList, isCart, cartProducts]);

  return (
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
