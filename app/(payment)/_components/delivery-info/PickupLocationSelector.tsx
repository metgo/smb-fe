import { RefObject } from "react";
import PriceTag from "@/components/PriceTag";
import { paymentPageLabels } from "@/constant/hebrew";
import { RadioButton } from "./RadioButton";

interface PickupLocationItem {
  area: string;
  price: string | number;
  pickUpLocation?: Array<{
    address: string;
  }>;
}

interface PickupLocationSelectorProps {
  item: PickupLocationItem;
  product: DeliveryProductInfo;
  isOpen: string;
  selectRef: RefObject<HTMLDivElement | any>;
  onUpdateDeliveryInfo: (updates: Partial<DeliveryProductInfo>) => void;
  onToggleOpen: (area: string) => void;
}

export const PickupLocationSelector = ({
  item,
  product,
  isOpen,
  selectRef,
  onUpdateDeliveryInfo,
  onToggleOpen,
}: PickupLocationSelectorProps) => {
  const isSelected = product.selectedDeliveryArea === item.area;

  const handleAreaSelect = () => {
    onUpdateDeliveryInfo({
      deliveryMethod: "deliver",
      deliveryFee: Number(item.price),
      selectedDeliveryArea: item.area,
      isSelected: true,
    });
  };

  const handleLocationSelect = (address: string) => {
    onUpdateDeliveryInfo({
      deliveryPickupLocation: address,
      deliveryFee: Number(item.price),
      isDeliveryToPointSelect: true,
      isDeliveryToHomeSelect: false,
      isSelected: true,
    });
    onToggleOpen("");
  };

  const handleDropdownToggle = () => {
    onToggleOpen(isOpen === item.area ? "" : item.area);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className="flex gap-3 items-center custom-cursor"
        onClick={handleAreaSelect}
      >
        <RadioButton isSelected={isSelected} />
        <div
          className={`text-[14px] flex gap-x-1 ${
            isSelected ? "font-bold" : "font-normal"
          }`}
        >
          <span>{item.area}</span>
          <PriceTag price={item.price} className="" />
        </div>
      </button>

      {isSelected && (
        <div className="ml-8 mt-2 custom-select-container" ref={selectRef}>
          <button
            className="custom-select-trigger text-[14px] text-dark bg-gray-200 font-normal w-[220px] border px-4 py-2 rounded-md flex justify-between items-center"
            onClick={handleDropdownToggle}
            type="button"
          >
            <span className="trigger-text">
              {product.deliveryPickupLocation ||
                paymentPageLabels.selectPickupPoint}
            </span>
            <span className="dropdown-icon transform transition-transform duration-200">
              {isOpen === item.area ? "▲" : "▼"}
            </span>
          </button>

          {isOpen === item.area && (
            <div className="custom-select-options absolute z-10 w-[220px] bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
              <div className="custom-select-option disabled p-3 text-gray-500 bg-gray-50 border-b">
                <span>{paymentPageLabels.selectPickupPoint}</span>
              </div>

              {item.pickUpLocation?.map((location, idx) => (
                <div key={idx}>
                  <button
                    className="custom-select-option flex items-center justify-between w-full p-3 hover:bg-gray-50 transition-colors duration-150 text-left"
                    onClick={() => handleLocationSelect(location.address)}
                    type="button"
                  >
                    <span className="option-address text-sm flex-1 pr-2">
                      {location.address}
                    </span>
                    <PriceTag price={item.price} className="flex-shrink-0" />
                  </button>
                  {idx < (item.pickUpLocation?.length || 0) - 1 && (
                    <div className="mx-2 h-[1px] bg-gray-200" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
