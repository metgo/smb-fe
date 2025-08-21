import { InputField } from "@/components/ui";
import { giftReceiverInfoFields } from "@/constant/formFields";

interface GiftReceiverFormProps {
  giftReceiverInfo: any;
  register: any;
  errors: any;
  onInputChange: (fieldId: string, value: string) => void;
}

export const GiftReceiverForm = ({
  giftReceiverInfo,
  register,
  errors,
  onInputChange,
}: GiftReceiverFormProps) => (
  <div className="flex flex-col md:flex-row gap-3 md:w-[83%] flex-wrap mt-2">
    {giftReceiverInfoFields.map((field) => (
      <InputField
        key={field.id}
        field={field}
        register={register}
        errors={errors}
        value={giftReceiverInfo[field.id as keyof typeof giftReceiverInfo]}
        onChange={(value) => onInputChange(field.id, value)}
      />
    ))}
  </div>
);
