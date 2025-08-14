import { InputField } from "@/components/ui";
import { deliveryAddressFields } from "@/constant/formFields";

interface HomeDeliveryFormProps {
  deliveryAddress: {
    city: string;
    street: string;
    houseNo: string;
    apartment: string;
    greeting: string;
  };
  register: any;
  errors: any;
  onInputChange: (fieldType: string, fieldId: string, value: string) => void;
}

export const HomeDeliveryForm = ({
  deliveryAddress,
  register,
  errors,
  onInputChange,
}: HomeDeliveryFormProps) => (
  <div className="flex flex-col gap-2 md:flex-row flex-wrap">
    {deliveryAddressFields.map((field) => (
      <InputField
        key={field.id}
        field={field}
        register={register}
        errors={errors}
        value={deliveryAddress[field.id as keyof typeof deliveryAddress]}
        onChange={(value) => onInputChange("deliveryAddress", field.id, value)}
      />
    ))}
  </div>
);
