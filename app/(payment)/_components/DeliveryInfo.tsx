import { useState } from "react";
import { useForm } from "react-hook-form";

import { InputField } from "@/components/ui";
import { TickIcon } from "@/components/ui/icons";
import { buttonLabels, formLabels, paymentPageLabels } from "@/constant/hebrew";
import {
  deliveryAddressFields,
  giftReceiverInfoFields,
} from "@/constant/formFields";

const tabs = [paymentPageLabels.forMe, paymentPageLabels.forGift];

const DeliveryInfo = ({
  secondInfo,
  // setErrorType,
  handleToggle,
  className,
}: DeliveryInfoProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const {
    register,
    formState: { errors },
  } = useForm();
  return (
    <div
      className={`bg-white p-4 max-sm:mx-3 rounded-md flex flex-col gap-4 shadow ${className}`}
    >
      <div
        onClick={() => handleToggle("second")}
        className="flex justify-between cursor-pointer"
      >
        <div
          className={`font-bold text-[16px] ${
            secondInfo ? "text-black" : "text-darkPrimary"
          }`}
        >
          2. משלוח
        </div>
      </div>
      {/* Product List */}
      <div></div>

      <section className="space-y-4">
        {/* Filter Tab */}
        <div className="flex items-center gap-4 bg-gray-300 shadow w-[max-content] p-1 rounded-md">
          {tabs.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`${activeTab === index ? "bg-white font-bold" : "font-normal"} px-4 py-2 cursor-pointer rounded-md`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Gift Part */}
        {activeTab === 1 && (
          <div className="flex flex-col md:flex-row gap-3 md:w-[83%] flex-wrap">
            {giftReceiverInfoFields.map((field) => (
              <InputField
                key={field.id}
                field={field}
                register={register}
                errors={errors}
              />
            ))}
          </div>
        )}

        {/* Delivery Address */}
        <div className="flex flex-col gap-2 md:flex-row flex-wrap">
          {deliveryAddressFields.map((field) => (
            <InputField
              key={field.id}
              field={field}
              register={register}
              errors={errors}
            />
          ))}
        </div>
      </section>

      <div className="flex gap-4 flex-col">
        <div
          onClick={() => {}}
          className="flex gap-2 items-center cursor-pointer"
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center border border-lightgray ${
              true ? "border-0" : "bg-white"
            }`}
          >
            <TickIcon color={""} />
          </div>
          <span
            className={`text-[14px] ${true ? "font-bold" : "font-semibold"}`}
          >
            {formLabels.pickUpFromBranch}
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-black text-white font-normal rounded-md cursor-pointer"
        >
          {buttonLabels.paymentIsOnGoing}
        </button>
      </div>
    </div>
  );
};

export default DeliveryInfo;
