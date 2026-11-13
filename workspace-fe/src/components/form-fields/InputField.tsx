import clsx from "clsx";

interface InputFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  inputClasses: string;
  error?: string;
  fieldRef?: React.RefObject<HTMLInputElement | null>;
  maxLength?: number;
  type?: string;
}

const InputField = ({
  value,
  onChange,
  placeholder,
  inputClasses,
  error,
  fieldRef,
  maxLength,
  type = "text",
}: InputFieldProps) => {
  return (
    <input
      ref={fieldRef}
      type={type}
      value={value}
      min={1}
      maxLength={maxLength}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={clsx(
        "w-full px-5 py-3 rounded-xl border transition-all focus:ring-2 focus:ring-teal-500/20",
        inputClasses,
        error && "border-red-500",
      )}
    />
  );
};

export default InputField;
