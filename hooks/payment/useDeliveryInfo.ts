import { useForm } from "react-hook-form";
import { useCallback, useEffect, useState } from "react";
import useCheckoutStore from "@/stores/checkoutStore";
import { postDeliveryInfo } from "@/actions/paymentActions";

export const useDeliveryInfo = (handleToggle: (step: StepType) => void) => {
  const {
    customerInfo,
    cartedProduct,
    orderProducts,
    setTotalDeliveryFee,
    setIsStepTwoSubmitBtnDisabled,
  } = useCheckoutStore();

  const [deliveryInfos, setDeliveryInfos] = useState<DeliveryProductInfo[]>([]);
  const [clickedProductId, setClickedProductId] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm();

  // Initialize delivery infos
  useEffect(() => {
    const initialDeliveryInfos = orderProducts.map((item) => ({
      isSelected: false,
      _id: item._id,
      name: item.name,
      imageSrc: item.image || "",
      alt: item.alt || "",
      quantity: 1,
      itemType: item.itemType,
      deliveryMethod: "",
      deliveryPickupLocation: "",
      deliveryFee: 0,
      activeTab: 0,
      selectedDeliveryArea: "",
      isDeliveryToPointSelect: false,
      isDeliveryToHomeSelect: false,
      deliveryToHome: item.deliveryArea.filter(
        (area) => !area.pickUpLocation || area.pickUpLocation.length === 0,
      ),
      deliveryToPoint: item.deliveryArea.filter(
        (area) => area.pickUpLocation && area.pickUpLocation.length > 0,
      ),
      giftReceiverInfo: {
        receiverPhone: "",
        receiverEmail: "",
        receiverMessage: "",
      },
      deliveryAddress: {
        city: "",
        street: "",
        houseNo: "",
        apartment: "",
        greeting: "",
      },
    }));

    setDeliveryInfos(initialDeliveryInfos);
    setClickedProductId(orderProducts?.[0]?._id);
  }, [orderProducts]);

  // Validation logic
  const validateDeliveryInfo = useCallback((item: DeliveryProductInfo) => {
    if (!item.isSelected || !item.selectedDeliveryArea) return false;

    // Gift receiver validation
    if (item.activeTab === 1) {
      const { receiverPhone, receiverEmail, receiverMessage } =
        item.giftReceiverInfo;
      if (!receiverPhone || !receiverEmail || !receiverMessage) return false;
    }

    // Home delivery validation
    if (item.isDeliveryToHomeSelect) {
      const { city, street, houseNo, apartment, greeting } =
        item.deliveryAddress;
      if (!city || !street || !houseNo || !apartment || !greeting) return false;
    }

    // Point delivery validation
    if (item.isDeliveryToPointSelect && !item.deliveryPickupLocation)
      return false;

    return true;
  }, []);

  // Update button disabled state
  useEffect(() => {
    const isInvalid = deliveryInfos.some((item) => !validateDeliveryInfo(item));
    setIsStepTwoSubmitBtnDisabled(isInvalid);
  }, [deliveryInfos, validateDeliveryInfo, setIsStepTwoSubmitBtnDisabled]);

  // Update total delivery fee
  useEffect(() => {
    const totalFee = deliveryInfos.reduce(
      (sum, product) => sum + product.deliveryFee,
      0,
    );
    setTotalDeliveryFee(totalFee);
  }, [deliveryInfos, setTotalDeliveryFee]);

  const updateDeliveryInfo = useCallback(
    (productId: string, updates: Partial<DeliveryProductInfo>) => {
      setDeliveryInfos((prev) =>
        prev.map((info) =>
          info._id === productId ? { ...info, ...updates } : info,
        ),
      );
    },
    [],
  );

  const handleInputChange = useCallback(
    (
      productId: string,
      fieldType: "giftReceiverInfo" | "deliveryAddress",
      fieldId: string,
      value: string,
    ) => {
      setDeliveryInfos((prev) =>
        prev.map((info) =>
          info._id === productId
            ? { ...info, [fieldType]: { ...info[fieldType], [fieldId]: value } }
            : info,
        ),
      );
    },
    [],
  );

  const handleProductClick = useCallback((productId: string) => {
    setClickedProductId(productId);
    // setDeliveryInfos(prev =>
    //   prev.map(info => ({ ...info, isSelected: info._id === productId }))
    // );
  }, []);

  const submitDeliveryInfo = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const promises = deliveryInfos.map(async (item) => {
        const payload = {
          productId: item._id,
          quantity: item.quantity,
          itemType: item.itemType,
          deliveryFee: item.deliveryFee,
          deliveryMethod: item.deliveryMethod,
          deliveryPickupLocation: item.deliveryPickupLocation,
          firstName: customerInfo?.firstName || "",
          email:
            item.activeTab === 1
              ? item.giftReceiverInfo.receiverEmail
              : customerInfo?.email
                ? customerInfo?.email
                : null,
          phone:
            item.activeTab === 1
              ? item.giftReceiverInfo.receiverPhone
              : customerInfo?.phone,
          isGift: item.activeTab === 1,
          ...(!item.isDeliveryToPointSelect &&
            item.deliveryAddress.city && {
              city: item.deliveryAddress.city,
              street: item.deliveryAddress.street,
              houseNo: item.deliveryAddress.houseNo,
              apartment: item.deliveryAddress.apartment,
              additionalInfo: item.deliveryAddress.greeting,
            }),
          ...(item.activeTab === 1 &&
            item.giftReceiverInfo.receiverMessage && {
              additionalInfo: item.giftReceiverInfo.receiverMessage,
            }),
        };

        return postDeliveryInfo(cartedProduct.cartId, payload);
      });

      await Promise.all(promises);
      handleToggle("third");
    } catch (error) {
      console.error("Delivery info submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [deliveryInfos, cartedProduct, customerInfo, handleToggle]);

  return {
    deliveryInfos,
    clickedProductId,
    isSubmitting,
    register,
    errors,
    handleSubmit,
    updateDeliveryInfo,
    handleInputChange,
    handleProductClick,
    submitDeliveryInfo,
    validateDeliveryInfo,
  };
};
