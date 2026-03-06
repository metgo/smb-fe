interface AuthInputFieldProps {
  value: string;
  isRequired?: boolean;
  onChange: (v: any) => void;
  type?: string;
  placeholder: string;
}

const AuthInputField = ({
  value,
  onChange,
  type = "text",
  placeholder,
  isRequired = false,
}: AuthInputFieldProps) => {
  return (
    <input
      type={type}
      required={isRequired}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/30"
    />
  );
};

export default AuthInputField;
