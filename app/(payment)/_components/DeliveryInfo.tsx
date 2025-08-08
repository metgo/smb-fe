import { memo, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { InputField } from "@/components/ui";
import { TickIcon } from "@/components/ui/icons";
import { buttonLabels, formLabels, paymentPageLabels } from "@/constant/hebrew";
import {
  deliveryAddressFields,
  giftReceiverInfoFields,
} from "@/constant/formFields";
import Image from "next/image";

const tabs = [paymentPageLabels.forMe, paymentPageLabels.forGift];

const RadioButton = ({ isSelected = false }: { isSelected: boolean }) => {
  return (
    <div
      className={`w-5 h-5 rounded-full flex items-center justify-center border border-lightgray ${isSelected ? "border-0" : "bg-white"}`}
    >
      {isSelected && <TickIcon />}
    </div>
  );
};

const DeliveryInfo = memo(
  ({ secondInfo, handleToggle, className, products }: DeliveryInfoProps) => {
    const selectRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState<string>("");
    const [clickedProductId, setClickedProductId] = useState<string>("");
    const [deliveryInfos, setDeliveryInfos] = useState<
      DeliveryProductsInfoProps[]
    >([]);
    const {
      register,
      formState: { errors },
      handleSubmit,
    } = useForm();

    useEffect(() => {
      const deliveryRelatedProducts = products.map((item) => ({
        isSelected: false,
        _id: item._id,
        name: item.name,
        imageSrc: item.images?.[0]?.image || "",
        alt: item.images?.[0]?.alt || "",
        quantity: 1,
        deliveryMethod: "",
        deliveryPickupLocation: "",
        deliveryFee: "",
        activeTab: 0,
        selectedDeliveryArea: "",
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
      setDeliveryInfos(deliveryRelatedProducts);
    }, [products]);

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

    const updateDeliveryInfo = (
      productId: string,
      updates: Partial<DeliveryProductsInfoProps>,
    ) => {
      setDeliveryInfos((prev) =>
        prev.map((info) =>
          info._id === productId ? { ...info, ...updates } : info,
        ),
      );
    };

    const handleInputChange = (
      productId: string,
      fieldType: "giftReceiverInfo" | "deliveryAddress",
      fieldId: string,
      value: string,
    ) => {
      setDeliveryInfos((prev) =>
        prev.map((info) => {
          if (info._id !== productId) return info;
          return {
            ...info,
            [fieldType]: {
              ...info[fieldType],
              [fieldId]: value,
            },
          };
        }),
      );
    };

    const onSubmit = () => {
      console.log("Form submitted:", deliveryInfos);
    };

    return (
      <div
        className={`bg-white p-4 max-sm:mx-3 rounded-md flex flex-col gap-4 shadow ${className}`}
      >
        <div
          onClick={() => handleToggle("second")}
          className="flex justify-between cursor-pointer"
        >
          <div
            className={`font-bold text-[16px] ${secondInfo ? "text-black" : "text-darkPrimary"}`}
          >
            2. משלוח
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {deliveryInfos.map((product) => (
            <div
              key={product._id}
              onClick={() => setClickedProductId(product._id)}
              className={`flex items-center gap-2 border border-black w-40 rounded-md p-1 cursor-pointer ${clickedProductId === product._id ? "bg-gray-100" : ""}`}
            >
              <Image
                alt={product.alt}
                src={product.imageSrc}
                width={36}
                height={36}
                className="rounded"
              />
              <div className="line-clamp-1">{product.name}</div>
            </div>
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
                        updateDeliveryInfo(product._id, { activeTab: index })
                      }
                      className={`${product.activeTab === index ? "bg-white font-bold" : "font-normal"} px-4 py-2 cursor-pointer rounded-md`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {product.activeTab === 1 && (
                  <div className="flex flex-col md:flex-row gap-3 md:w-[83%] flex-wrap">
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
                  {product.deliveryToHome.map((deliveryArea) => {
                    const isSelected =
                      product.selectedDeliveryArea === deliveryArea.area;
                    return (
                      <div key={deliveryArea.area}>
                        <div
                          className="flex gap-3 items-center cursor-pointer"
                          onClick={() =>
                            updateDeliveryInfo(product._id, {
                              selectedDeliveryArea: deliveryArea.area,
                              deliveryFee: deliveryArea.price,
                            })
                          }
                        >
                          <RadioButton isSelected={isSelected} />
                          <span
                            className={`text-[14px] flex gap-x-1 ${isSelected ? "font-bold" : "font-semibold"}`}
                          >
                            <span>{deliveryArea.area}</span>
                            <span>₪{deliveryArea.price}</span>
                          </span>
                        </div>
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
                        <div
                          className="flex gap-3 items-center cursor-pointer"
                          onClick={() =>
                            updateDeliveryInfo(product._id, {
                              selectedDeliveryArea: item.area,
                            })
                          }
                        >
                          <RadioButton isSelected={isSelected} />
                          <div
                            className={`text-[14px] flex gap-x-1 ${isSelected ? "font-bold" : "font-semibold"}`}
                          >
                            <span>{item.area}</span>
                            <span>₪{item.price}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div
                            className="ml-8 mt-2 custom-select-container"
                            ref={selectRef}
                          >
                            <div
                              className="custom-select-trigger text-[14px] text-dark bg-gray-200 font-normal w-[220px] border px-4 py-2 rounded-md"
                              onClick={() =>
                                setIsOpen(isOpen === item.area ? "" : item.area)
                              }
                            >
                              <span className="trigger-text">
                                {product.deliveryPickupLocation ||
                                  "בחר נקודת איסוף"}
                              </span>
                              <span className="dropdown-icon">▼</span>
                            </div>
                            {isOpen === item.area && (
                              <div className="custom-select-options pb-3">
                                <div className="custom-select-option disabled">
                                  <span>בחר נקודת איסוף</span>
                                </div>
                                {item.pickUpLocation?.map((location, idx) => (
                                  <div key={idx}>
                                    <div
                                      className="custom-select-option"
                                      onClick={() => {
                                        updateDeliveryInfo(product._id, {
                                          deliveryPickupLocation:
                                            location.address,
                                          deliveryFee: item.price,
                                        });
                                        setIsOpen("");
                                      }}
                                    >
                                      <span className="option-address">
                                        {location.address}
                                      </span>
                                      <span className="option-price">
                                        {item.price}₪
                                      </span>
                                    </div>
                                    <div className="mt-1 w-[95%] mx-auto h-[1px] bg-lightgray" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={() =>
                    updateDeliveryInfo(product._id, {
                      selectedDeliveryArea: "pick_up",
                    })
                  }
                >
                  <RadioButton
                    isSelected={product.selectedDeliveryArea === "pick_up"}
                  />
                  <span className="text-[14px] font-bold">
                    {formLabels.pickUpFromBranch}
                  </span>
                </div>
              </section>
            ),
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white font-normal rounded-md cursor-pointer"
          >
            {buttonLabels.paymentIsOnGoing}
          </button>
        </form>
      </div>
    );
  },
);

export default DeliveryInfo;
