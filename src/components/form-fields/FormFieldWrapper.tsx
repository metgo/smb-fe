import { useThemeClasses } from "@/hooks/useThemeClasses";

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
  inputHintText?: string;
}

const FormFieldWrapper = ({
  label,
  required,
  error,
  children,
  hint = "",
  inputHintText = "",
}: FormFieldWrapperProps) => {
  const { textTertiary, textSecondary } = useThemeClasses();
  return (
    <div>
      <label
        className={`block text-sm font-medium mb-3 space-x-2 ${textSecondary}`}
      >
        {label} {required && <span className="text-red-500">*</span>}
        {hint && (
          <span className={`text-xs ml-2 ${textTertiary}`}>({hint})</span>
        )}
        {inputHintText && (
          <span className={`text-xs mt-2 text-right italic ${textTertiary}`}>
            ({inputHintText})
          </span>
        )}
      </label>

      {children}

      <div className="flex items-center justify-between">
        {error && (
          <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};
export default FormFieldWrapper;
