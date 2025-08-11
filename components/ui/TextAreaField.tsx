const TextAreaField: React.FC<InputFieldProps> = ({
  field,
  register,
  errors,
}) => {
  const hasError = !!errors[field.id as keyof FormData];

  return (
    <div className="relative">
      <textarea
        id={field.id}
        {...register(field.id as keyof FormData, { required: true })}
        rows={field.rows}
        placeholder=" "
        className={`${
          hasError ? "border-secondary" : "border-lightgray"
        } text-[14px] font-semibold peer border bg-transparent rounded-md px-2 pt-2 pb-2 focus:outline-none ${field.className}`}
      />
      <label
        htmlFor={field.id}
        className="absolute right-3 top-[-2px] text-darkgray text-[0.75rem] transition-all peer-placeholder-shown:top-[5px] peer-placeholder-shown:text-base peer-placeholder-shown:text-darkgray peer-focus:top-[-2px] peer-focus:text-[0.75rem]"
      >
        {field.required && <span className="mr-1">*</span>}
        {field.label}
      </label>
      {hasError && (
        <p className="text-secondary text-[12px] mt-1">
          {errors[field.id as keyof FormData]?.message || "שדה זה נדרש"}
        </p>
      )}
    </div>
  );
};
export default TextAreaField;
