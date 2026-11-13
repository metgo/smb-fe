import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { useUtmFormStyles } from "../hooks/useUtmFormStyles";

interface FormFieldProps {
  label: string;
  icon?: LucideIcon;
  required?: boolean;
  // Small grey note after the label, e.g. "optional".
  hint?: string;
  help?: string;
  children: ReactNode;
}

const FormField = ({
  label,
  icon: Icon,
  required,
  hint,
  help,
  children,
}: FormFieldProps) => {
  const { fieldLabel, optionalTag, helpText } = useUtmFormStyles();
  return (
    <div>
      <label className={fieldLabel}>
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
        {required && <span className="text-red-500">*</span>}
        {hint && <span className={optionalTag}>{hint}</span>}
      </label>
      {children}
      {help && <p className={helpText}>{help}</p>}
    </div>
  );
};

export default FormField;
