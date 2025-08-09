"use client";

import OrderInfo from "./OrderInfo";
import DeliveryInfo from "./DeliveryInfo";
import PaymentInfo from "./PaymentInfo";
import ProductInfo from "./ProductInfo";

import { usePayment } from "@/hooks/usePayment";
import { useEffect } from "react";
import useCheckoutStore from "@/stores/checkoutStore";

const PaymentSections = ({
  cartDetails,
  productDetails,
}: {
  cartDetails: any;
  productDetails: ProductInfoProps;
}) => {
  const { setCartedProduct, setOrderProducts } = useCheckoutStore();

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
  );
};

export default PaymentSections;
