"use client";

import clsx from "clsx";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { FaCircleCheck } from "react-icons/fa6";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import PriceTag from "@/components/PriceTag";
import useCheckoutStore from "@/stores/checkoutStore";
import { InputField, SubmitButton } from "@/components/ui";
import { postDeliveryInfo } from "@/actions/paymentActions";
import { buttonLabels, formLabels, paymentPageLabels } from "@/constant/hebrew";
import {
  deliveryAddressFields,
  giftReceiverInfoFields,
} from "@/constant/formFields";

const tabs = [paymentPageLabels.forMe, paymentPageLabels.forGift];

const RadioButton = memo(({ isSelected }: { isSelected: boolean }) => (
  <div
    className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? "border-0" : "bg-white"}`}
  >
    {isSelected && <FaCircleCheck size={30} />}
  </div>
));

const DeliveryInfo = memo(
  ({ secondInfo, handleToggle, className }: DeliveryInfoProps) => {
    const {
      customerInfo,
      cartedProduct,
      orderProducts,
      setTotalDeliveryFee,
      setIsStepTwoSubmitBtnDisabled,
      isStepOneSubmitBtnDisabled,
    } = useCheckoutStore();

    const selectRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState<string>("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [clickedProductId, setClickedProductId] = useState<string>();
    const [deliveryInfos, setDeliveryInfos] = useState<
      DeliveryProductsInfoProps[]
    >([]);
    const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
      register,
      formState: { errors },
      handleSubmit,
    } = useForm();

    // Initialize delivery infos
    useEffect(() => {
      setDeliveryInfos(
        orderProducts.map((item, index) => ({
          isSelected: index === 0,
          _id: item._id,
          name: item.name,
          imageSrc: item.image || "",
          alt: item.alt || "",
          quantity: 1,
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
        })),
      );
      setClickedProductId(orderProducts?.[0]?._id);
    }, [orderProducts]);

    useEffect(() => {
      const shouldDisable = deliveryInfos.some((item) => {
        // Must be selected and have a selectedDeliveryArea
        if (!item.isSelected || !item.selectedDeliveryArea) {
          return true;
        }

        // If activeTab === 1, all giftReceiverInfo fields must be filled
        if (
          item.activeTab === 1 &&
          (!item.giftReceiverInfo.receiverPhone ||
            !item.giftReceiverInfo.receiverEmail ||
            !item.giftReceiverInfo.receiverMessage)
        ) {
          return true;
        }

        // If deliveryMethod is "deliver" and it's from deliveryToHome
        if (
          item.isDeliveryToHomeSelect &&
          (!item.deliveryAddress.city ||
            !item.deliveryAddress.street ||
            !item.deliveryAddress.houseNo ||
            !item.deliveryAddress.apartment ||
            !item.deliveryAddress.greeting)
        ) {
          return true;
        }

        if (item.isDeliveryToPointSelect && !item.deliveryPickupLocation)
          return false;

        return false;
      });

      setIsButtonDisabled(shouldDisable);
    }, [deliveryInfos]);

    useEffect(() => {
      setIsStepTwoSubmitBtnDisabled(isButtonDisabled ? true : false);
    }, [isButtonDisabled]);

    // Handle click outside for dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          selectRef.current &&
          !selectRef.current.contains(event.target as Node)
        ) {
          setIsOpen("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update total delivery fee whenever deliveryInfos changes
    useEffect(() => {
      const totalFee = deliveryInfos.reduce(
        (sum, product) => sum + product.deliveryFee,
        0,
      );
      setTotalDeliveryFee(totalFee);
    }, [deliveryInfos, setTotalDeliveryFee]);

    useEffect(() => {
      if (isSubmitSuccess) {
        handleToggle("third");
        setIsSubmitSuccess(false);
      }
    }, [isSubmitSuccess]);

    const updateDeliveryInfo = useCallback(
      (productId: string, updates: Partial<DeliveryProductsInfoProps>) => {
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
              ? {
                  ...info,
                  [fieldType]: { ...info[fieldType], [fieldId]: value },
                }
              : info,
          ),
        );
      },
      [],
    );

    const onSubmit = useCallback(async () => {
      setIsSubmitting(true);
      try {
        for (const item of deliveryInfos) {
          const { receiverEmail, receiverMessage, receiverPhone } =
            item.giftReceiverInfo;
          const { city, houseNo, street, apartment, greeting } =
            item.deliveryAddress;

          const payloadBody = {
            productId: item._id,
            quantity: item.quantity,
            deliveryFee: item.deliveryFee,
            deliveryMethod: item.deliveryMethod,
            deliveryPickupLocation: item.deliveryPickupLocation,
            firstName: customerInfo?.firstName || "",
            email:
              item.activeTab === 1
                ? receiverEmail
                : customerInfo?.email || null,
            phone:
              item.activeTab === 1
                ? receiverPhone
                : customerInfo?.phone || null,
            isGift: item.activeTab === 1,
            // Only include delivery address fields if isDeliveryToPointSelect is false
            ...(!item.isDeliveryToPointSelect && city && { city }),
            ...(!item.isDeliveryToPointSelect && street && { street }),
            ...(!item.isDeliveryToPointSelect && houseNo && { houseNo }),
            ...(!item.isDeliveryToPointSelect && apartment && { apartment }),
            ...(!item.isDeliveryToPointSelect &&
              greeting && { additionalInfo: greeting }),
            ...(item.activeTab === 1 &&
              receiverMessage && { additionalInfo: receiverMessage }),
          };

          const res = await postDeliveryInfo(cartedProduct.cartId, payloadBody);
          setIsSubmitSuccess(!!res.message);
        }
      } catch {
        console.log("something went wrong");
      } finally {
        setIsSubmitting(false);
      }
    }, [deliveryInfos, cartedProduct, customerInfo, handleToggle]);

    const handleProductClick = useCallback((productId: string) => {
      setClickedProductId(productId);
      setDeliveryInfos((prev) =>
        prev.map((info) => ({
          ...info,
          isSelected: info._id === productId,
        })),
      );
    }, []);

    return (
      <div
        className={`bg-white p-4 max-sm:mx-3 rounded-md flex flex-col gap-4 shadow ${className}`}
      >
        <button
          aria-expanded={secondInfo}
          onClick={() => handleToggle("second")}
          className="flex justify-between cursor-pointer"
        >
          <span
            className={`font-bold text-[16px] ${secondInfo ? "text-black" : "text-darkPrimary"}`}
          >
            2. {paymentPageLabels.sending}
          </span>
        </button>

        {secondInfo && (
          <>
            <div className="flex gap-2 flex-wrap">
              {deliveryInfos.map((product) => (
                <button
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                  className={`flex items-center gap-2 border w-48 rounded-md p-1 cursor-pointer ${clickedProductId === product._id ? "bg-gray-100 shadow border-black/40" : ""}`}
                >
                  <Image
                    alt={product.alt}
                    src={product.imageSrc}
                    width={40}
                    height={20}
                    className="rounded h-12 w-20 object-cover"
                  />
                  <span className="line-clamp-1">{product.name}</span>
                </button>
              ))}
            </div>

            {deliveryInfos.map(
              (product) =>
                clickedProductId === product._id && (
                  <section key={product._id} className="space-y-4">
                    <div className="flex items-center gap-4 bg-black/10 shadow w-max p-1 rounded-md">
                      {tabs.map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() =>
                            updateDeliveryInfo(product._id, {
                              activeTab: index,
                            })
                          }
                          className={`${product.activeTab === index ? "bg-white font-bold" : "font-normal"} px-4 py-2 cursor-pointer rounded-md`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>

                    {product.activeTab === 1 && (
                      <div className="flex flex-col md:flex-row gap-3 md:w-[83%] flex-wrap mt-2">
                        {giftReceiverInfoFields.map((field) => (
                          <InputField
                            key={field.id}
                            field={field}
                            register={register}
                            errors={errors}
                            value={
                              product.giftReceiverInfo[
                                field.id as keyof typeof product.giftReceiverInfo
                              ]
                            }
                            onChange={(value) =>
                              handleInputChange(
                                product._id,
                                "giftReceiverInfo",
                                field.id,
                                value,
                              )
                            }
                          />
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      {product?.deliveryToHome?.map((deliveryArea) => {
                        const isSelected =
                          product.selectedDeliveryArea === deliveryArea.area;
                        return (
                          <div key={deliveryArea.area}>
                            <button
                              className="flex gap-3 items-center cursor-pointer mb-2"
                              onClick={() =>
                                updateDeliveryInfo(product._id, {
                                  deliveryMethod: "deliver",
                                  selectedDeliveryArea: deliveryArea.area,
                                  deliveryFee: Number(deliveryArea.price),
                                  isDeliveryToHomeSelect: true,
                                  isDeliveryToPointSelect: false,
                                })
                              }
                            >
                              <RadioButton isSelected={isSelected} />
                              <span
                                className={`text-[14px] flex gap-x-1 ${isSelected ? "font-bold" : "font-normal"}`}
                              >
                                <span>{deliveryArea.area}</span>
                                <PriceTag
                                  price={deliveryArea.price}
                                  className=""
                                />
                              </span>
                            </button>
                            {isSelected && (
                              <div className="flex flex-col gap-2 md:flex-row flex-wrap">
                                {deliveryAddressFields.map((field) => (
                                  <InputField
                                    key={field.id}
                                    field={field}
                                    register={register}
                                    errors={errors}
                                    value={
                                      product.deliveryAddress[
                                        field.id as keyof typeof product.deliveryAddress
                                      ]
                                    }
                                    onChange={(value) =>
                                      handleInputChange(
                                        product._id,
                                        "deliveryAddress",
                                        field.id,
                                        value,
                                      )
                                    }
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-2">
                      {product.deliveryToPoint.map((item) => {
                        const isSelected =
                          product.selectedDeliveryArea === item.area;
                        return (
                          <div key={item.area} className="flex flex-col gap-2">
                            <button
                              className="flex gap-3 items-center cursor-pointer"
                              onClick={() =>
                                updateDeliveryInfo(product._id, {
                                  deliveryMethod: "deliver",
                                  deliveryFee: Number(item.price),
                                  selectedDeliveryArea: item.area,
                                })
                              }
                            >
                              <RadioButton isSelected={isSelected} />
                              <div
                                className={`text-[14px] flex gap-x-1 ${isSelected ? "font-bold" : "font-normal"}`}
                              >
                                <span>{item.area}</span>
                                <PriceTag price={item.price} className="" />
                              </div>
                            </button>
                            {isSelected && (
                              <div
                                className="ml-8 mt-2 custom-select-container"
                                ref={selectRef}
                              >
                                <button
                                  className="custom-select-trigger text-[14px] text-dark bg-gray-200 font-normal w-[220px] border px-4 py-2 rounded-md"
                                  onClick={() =>
                                    setIsOpen(
                                      isOpen === item.area ? "" : item.area,
                                    )
                                  }
                                >
                                  <span className="trigger-text">
                                    {product.deliveryPickupLocation ||
                                      paymentPageLabels.selectPickupPoint}
                                  </span>
                                  <span className="dropdown-icon">▼</span>
                                </button>
                                {isOpen === item.area && (
                                  <div className="custom-select-options pb-3">
                                    <div className="custom-select-option disabled">
                                      <span>
                                        {paymentPageLabels.selectPickupPoint}
                                      </span>
                                    </div>
                                    {item.pickUpLocation?.map(
                                      (location, idx) => (
                                        <div key={idx}>
                                          <button
                                            className="custom-select-option flex items-center justify-between w-full"
                                            onClick={() => {
                                              updateDeliveryInfo(product._id, {
                                                deliveryPickupLocation:
                                                  location.address,
                                                deliveryFee: Number(item.price),
                                                isDeliveryToPointSelect: true,
                                                isDeliveryToHomeSelect: false,
                                              });
                                              setIsOpen("");
                                            }}
                                          >
                                            <span className="option-address">
                                              {location.address}
                                            </span>
                                            <PriceTag
                                              price={item.price}
                                              className=""
                                            />
                                          </button>
                                          <div className="mt-1 w-[95%] mx-auto h-[1px] bg-lightgray" />
                                        </div>
                                      ),
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      className="flex gap-2 items-center cursor-pointer"
                      onClick={() =>
                        updateDeliveryInfo(product._id, {
                          deliveryFee: 0,
                          selectedDeliveryArea: "pick_up",
                          deliveryMethod: "pick_up",
                          deliveryPickupLocation: "pick_up",
                          isDeliveryToPointSelect: false,
                          isDeliveryToHomeSelect: false,
                        })
                      }
                    >
                      <RadioButton
                        isSelected={product.selectedDeliveryArea === "pick_up"}
                      />
                      <span
                        className={clsx(
                          `text-[14px]`,
                          product.selectedDeliveryArea === "pick_up"
                            ? "font-bold"
                            : "font-normal",
                        )}
                      >
                        {formLabels.pickUpFromBranch}
                      </span>
                    </button>
                  </section>
                ),
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex justify-end"
            >
              <SubmitButton
                isDisabled={
                  isButtonDisabled || isSubmitting || isStepOneSubmitBtnDisabled
                }
                label={buttonLabels.paymentIsOnGoing}
              />
            </form>
          </>
        )}
      </div>
    );
  },
);

export default DeliveryInfo;
