interface TextareaFieldProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  rows?: number;
  maxLength?: number;
  inputClasses: string;
}

const TextareaField = ({
  value,
  onChange,
  placeholder,
  rows = 6,
  maxLength = 500,
  inputClasses,
}: TextareaFieldProps) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className={`w-full px-5 py-4 rounded-xl border resize-none transition-all focus:ring-2 focus:ring-teal-500/20 ${inputClasses}`}
    />
  );
};
export default TextareaField;
