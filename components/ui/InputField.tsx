import React from "react";
import { FieldErrors } from "react-hook-form";

interface InputFieldProps {
  field: {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    className?: string;
    isPriceField?: boolean;
    rows?: number;
  };
  register: any;
  errors: FieldErrors<FormData>;
  value?: string;
  onChange?: (value: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({
  field,
  register,
  errors,
  value,
  onChange,
}) => {
  const hasError = !!errors[field.id as keyof FormData];
  const isTextarea = field.type === "textarea";
  const isControlled = value !== undefined && onChange !== undefined;

  // Combine react-hook-form registration with custom onChange handler
  const inputProps = isControlled
    ? {
        value,
        onChange: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => {
          onChange(e.target.value);
        },
      }
    : {
        ...register(field.id as keyof FormData, {
          required: field.required,
        }),
      };

  return (
    <div className={`relative font-normal ${field.className}`}>
      {isTextarea ? (
        <textarea
          id={field.id}
          {...inputProps}
          rows={field.rows || 3}
          placeholder=" "
          className={`${hasError ? "border-secondary" : "border-black/30"} w-full text-[14px] font-semibold peer border bg-transparent rounded-md px-2 pt-2 pb-2 focus:outline-none`}
        />
      ) : (
        <>
          <input
            dir="rtl"
            type={field.type}
            id={field.id}
            {...inputProps}
            placeholder=" "
            className={`${hasError ? "border-red-500 shake" : "border-black/30"} w-full text-[14px] font-semibold peer border bg-transparent rounded-md px-2 pt-2 pb-2 focus:outline-none`}
          />
          {field.isPriceField && (
            <p className="absolute left-[5%] top-2 text-lg font-semibold">₪</p>
          )}
        </>
      )}

      <label
        htmlFor={field.id}
        className="absolute right-2 top-[-2px] text-darkgray text-[0.75rem] transition-all peer-placeholder-shown:top-[5px] peer-placeholder-shown:text-base peer-placeholder-shown:text-darkgray peer-focus:top-[-2px] peer-focus:text-[0.75rem]"
      >
        {field.required && <span className="mr-1">*</span>}
        {field.label}
      </label>

      {hasError && (
        <p className="text-red-500 text-[12px] mt-1 shake">
          {errors[field.id as keyof FormData]?.message || "שדה זה נדרש"}
        </p>
      )}
    </div>
  );
};

export default InputField;
