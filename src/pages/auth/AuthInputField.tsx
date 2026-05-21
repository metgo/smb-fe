import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative">
      <input
        type={isPassword && showPassword ? "text" : type}
        required={isRequired}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "auth-input w-full px-6 py-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/30",
          isPassword && "pe-12",
        )}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-e-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/90 transition-colors"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

export default AuthInputField;
