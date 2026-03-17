import { toast } from "sonner";
import { useState } from "react";
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
import { useTranslation } from "react-i18next";
import AuthInputField from "./AuthInputField";
import AuthHeader from "./AuthHeader";

interface SignupProps {
  setCurrentTab: (v: string) => void;
}

export function Signup({ setCurrentTab }: SignupProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("login");

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
      sessionStorage.setItem("user_info", JSON.stringify({ user: res.user }));
      sessionStorage.setItem("access_token", res.accessToken);
      dispatch(loginSuccess(res.user));
    }
    navigate(routes.dashboard, { replace: true });
    toast.success(
      t("welcome_user", {
        firstName: res.user.firstName,
        lastName: res.user.lastName,
      }),
    );
    setError("");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          <AuthHeader
            title="register"
            desc="already_have_account"
            btnText="login"
            handleCurrentTabChange={() => setCurrentTab("login")}
          />

          {step === 1 && (
            <form onSubmit={handleRegisterStep1} className="space-y-6">
              <AuthInputField
                isRequired
                value={firstName}
                placeholder={t("first_name")}
                onChange={setFirstName}
              />
              <AuthInputField
                isRequired
                value={email}
                type="email"
                placeholder={t("email")}
                onChange={setEmail}
              />
              {error && <p className="text-red-300 text-sm">{error}</p>}
              <SubmitButton
                label={t("next")}
                loading={step1Loading}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg py-7 "
              />
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleRegisterStep2} className="space-y-6">
              <AuthInputField
                isRequired
                value={lastName}
                placeholder={t("last_name")}
                onChange={setLastName}
              />
              <AuthInputField
                isRequired
                value={phone}
                type="number"
                placeholder={t("phone_number")}
                onChange={setPhone}
              />
              <AuthInputField
                isRequired
                value={password}
                type="password"
                placeholder={t("password")}
                onChange={setPassword}
              />
              {error && <p className="text-red-300 text-sm">{error}</p>}
              <SubmitButton
                loading={step2Loading}
                label={t("register")}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg py-7"
              />
            </form>
          )}

          {/* Divider */}
          <div className="text-center text-white/80 py-6">{t("or")}</div>

          <ContinueWithGoogle />
        </div>
      </div>
    </div>
  );
}
