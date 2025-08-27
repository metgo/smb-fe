import { useState, useRef, useEffect } from "react";

import PriceTag from "@/components/PriceTag";
import { paymentPageLabels } from "@/constant/hebrew";
import { RadioButton } from "./RadioButton";
import { HomeDeliveryForm } from "./HomeDeliveryForm";
import { PickupLocationSelector } from "./PickupLocationSelector";

interface DeliveryOptionsProps {
  product: DeliveryProductInfo;
  onUpdateDeliveryInfo: (updates: Partial<DeliveryProductInfo>) => void;
  register: any;
  errors: any;
  onInputChange: (fieldType: string, fieldId: string, value: string) => void;
}

export const DeliveryOptions = ({
  product,
  onUpdateDeliveryInfo,
  register,
  errors,
  onInputChange,
}: DeliveryOptionsProps) => {
  const selectRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<string>("");

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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Home Delivery Options */}
      <div className="space-y-2">
        {product.deliveryToHome?.map((deliveryArea) => (
          <div key={deliveryArea.area}>
            <button
              className="flex gap-3 items-center custom-cursor mb-2"
              onClick={() =>
                onUpdateDeliveryInfo({
                  deliveryMethod: "deliver",
                  selectedDeliveryArea: deliveryArea.area,
                  deliveryFee: Number(deliveryArea.price),
                  isDeliveryToHomeSelect: true,
                  isDeliveryToPointSelect: false,
                })
              }
            >
              <RadioButton
                isSelected={product.selectedDeliveryArea === deliveryArea.area}
              />
              <span
                className={`text-[14px] flex gap-x-1 ${
                  product.selectedDeliveryArea === deliveryArea.area
                    ? "font-bold"
                    : "font-normal"
                }`}
              >
                <span>{deliveryArea.area}</span>
                <PriceTag price={deliveryArea.price} className="" />
              </span>
            </button>
            {product.selectedDeliveryArea === deliveryArea.area && (
              <HomeDeliveryForm
                deliveryAddress={product.deliveryAddress}
                register={register}
                errors={errors}
                onInputChange={onInputChange}
              />
            )}
          </div>
        ))}
      </div>

      {/* Pickup Point Options */}
      <div className="space-y-2">
        {product.deliveryToPoint.map((item) => (
          <PickupLocationSelector
            key={item.area}
            item={item}
            product={product}
            isOpen={isOpen}
            selectRef={selectRef}
            onUpdateDeliveryInfo={onUpdateDeliveryInfo}
            onToggleOpen={setIsOpen}
          />
        ))}
      </div>

      {/* Branch Pickup Option */}
      <button
        className="flex gap-2 items-center custom-cursor"
        onClick={() =>
          onUpdateDeliveryInfo({
            deliveryFee: 0,
            isSelected: true,
            selectedDeliveryArea: "pick_up",
            deliveryMethod: "pick_up",
            deliveryPickupLocation: "pick_up",
            isDeliveryToPointSelect: false,
            isDeliveryToHomeSelect: false,
          })
        }
      >
        <RadioButton isSelected={product.selectedDeliveryArea === "pick_up"} />
        <span
          className={`text-[14px] ${
            product.selectedDeliveryArea === "pick_up"
              ? "font-bold"
              : "font-normal"
          }`}
        >
          {paymentPageLabels.pickupFromBranchFree}
        </span>
      </button>
    </div>
  );
};
