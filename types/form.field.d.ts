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

declare interface InputFieldProps {
  field: FieldConfig;
  register: any;
  errors: any;
}
