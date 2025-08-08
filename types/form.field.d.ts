declare interface FieldConfig {
  id: string;
  label: string;
  type: "text" | "textarea" | "tel" | "email" | "number";
  placeholder?: string;
  required?: boolean;
  rows?: number;
  className?: string;
  isPriceField?: boolean;
  containerClassName?: string;
}

interface InputFieldProps {
  field: FieldConfig;
  value: string;
  onChange: (id: string, value: string) => void;
}
