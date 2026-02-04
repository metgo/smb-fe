import { toast } from "sonner";
import { useState } from "react";
import { Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { routes } from "@/lib/routes";
import { SubmitButton } from "@/components/btns";
import { normalizePhone } from "@/helpers/formatter";
import ContinueWithGoogle from "./ContinueWithGoogle";
import {
  useRegisterStep1Mutation,
  useRegisterStep2Mutation,
} from "@/store/api/authApi";
import { useAppDispatch } from "@/hooks/hooks";
import { loginSuccess } from "@/features/authSlice";

interface SignupProps {
  setCurrentTab: (v: string) => void;
}

interface InputFieldProps {
  value: string;
  isRequired?: boolean;
  onChange: (v: any) => void;
  type?: string;
  placeholder: string;
}

const InputField = ({
  value,
  onChange,
  type = "text",
  placeholder,
  isRequired = false,
}: InputFieldProps) => {
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

export function Signup({ setCurrentTab }: SignupProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [registerStep1, { isLoading: step1Loading }] =
    useRegisterStep1Mutation();
  const [registerStep2, { isLoading: step2Loading }] =
    useRegisterStep2Mutation();

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await registerStep1({ email, firstName }).unwrap();
    if (res) {
      setUserId(res.id);
      setStep(2);
      setError("");
    }
  };

  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const languagePreference = "en";
    const phoneNumber = normalizePhone(phone);
    const res = await registerStep2({
      userId,
      lastName,
      password,
      phoneNumber,
      languagePreference,
    }).unwrap();

    if (typeof window !== "undefined") {
      localStorage.setItem("user_info", JSON.stringify({ user: res.user }));
      localStorage.setItem("access_token", res.accessToken);
      dispatch(loginSuccess(res.user));
    }
    navigate(routes.dashboard, { replace: true });
    toast.success(`Welcome ${res.user.firstName} ${res.user.lastName}`);
    setError("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            {/* <img src={logoImage} alt="Logo" className="w-16 h-16" /> */}
          </div>

          {/* Title */}
          <h1 className="text-4xl text-white mb-4">Register</h1>

          {/* Subtitle */}
          <p className="text-white/80 mb-8">
            Already have an account?{" "}
            <button
              onClick={() => setCurrentTab("login")}
              className="text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
            >
              Login
            </button>
          </p>

          {step === 1 && (
            <form onSubmit={handleRegisterStep1} className="space-y-6">
              <InputField
                isRequired
                value={firstName}
                placeholder="Enter your first name *"
                onChange={setFirstName}
              />
              <InputField
                isRequired
                value={email}
                type="email"
                placeholder="Enter your email *"
                onChange={setEmail}
              />
              {error && <p className="text-red-300 text-sm">{error}</p>}
              <SubmitButton
                label="Next"
                loading={step1Loading}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg py-7 "
              />
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRegisterStep2} className="space-y-6">
              <InputField
                isRequired
                value={lastName}
                placeholder="Enter your last name *"
                onChange={setLastName}
              />
              <InputField
                isRequired
                value={phone}
                type="number"
                placeholder="Enter your phone number *"
                onChange={setPhone}
              />
              <InputField
                isRequired
                value={password}
                type="password"
                placeholder="Enter your password *"
                onChange={setPassword}
              />
              {error && <p className="text-red-300 text-sm">{error}</p>}
              <SubmitButton
                loading={step2Loading}
                label="Register"
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg py-7"
              />
            </form>
          )}

          {/* Divider */}
          <div className="text-center text-white/80 py-6">Or</div>

          <ContinueWithGoogle />
        </div>
      </div>
    </div>
  );
}
