import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import useCheckoutStore from "@/stores/checkoutStore";
import { InputField, SubmitButton } from "@/components/ui";
import { orderInfoFields } from "@/constant/formFields";
import { buttonLabels, paymentPageLabels } from "@/constant/hebrew";
import { PurchaserInfo, purchaserSchema } from "@/schemas/payment";

const OrderInfo = ({ handleToggle, firstInfo, className }: OrderInfoProps) => {
  const { setCustomerInfo, setIsStepOneSubmitBtnComplete } = useCheckoutStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<PurchaserInfo>({
    resolver: zodResolver(purchaserSchema),
    defaultValues: {
      firstName: "",
      phone: "",
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: PurchaserInfo) => {
    setCustomerInfo({
      firstName: data.firstName,
      email: data.email || "",
      phone: data.phone || "",
    });
    handleToggle("second");
  };

  const isButtonDisabled = !isValid;
  // !watch("firstName") || (!watch("phone") && !watch("email"));

  useEffect(() => {
    setIsStepOneSubmitBtnComplete(isButtonDisabled ? true : false);
  }, [isButtonDisabled]);

  return (
    <div
      className={`bg-white p-4 max-sm:mx-3 rounded-md flex flex-col gap-4 shadow ${className}`}
    >
      <div
        role="button"
        aria-expanded={firstInfo}
        onClick={() => handleToggle("first")}
        className="flex justify-between cursor-pointer"
      >
        <h2
          className={`font-bold text-[16px] ${
            firstInfo ? "text-black" : "text-darkPrimary"
          }`}
        >
          1. {paymentPageLabels.personalDetails}
        </h2>
        {!firstInfo &&
          watch("firstName") &&
          (watch("phone") || watch("email")) && (
            <div className="flex gap-2 text-sm text-gray-600 font-normal">
              <span>{watch("firstName")}</span>
              {watch("phone") && <span>{watch("phone")}</span>}
              {watch("email") && <span>{watch("email")}</span>}
            </div>
          )}
      </div>

      {firstInfo && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="text-[14px] font-semibold">
            {paymentPageLabels.continueAsGuest}
          </div>

          {orderInfoFields.map((field) => (
            <InputField
              key={field.id}
              field={field}
              register={register}
              errors={errors}
            />
          ))}

          <div className="flex justify-end">
            <SubmitButton
              isDisabled={isButtonDisabled}
              label={buttonLabels.continueToSelectDelivery}
            />
          </div>
        </form>
      )}
    </div>
  );
};

export default OrderInfo;
