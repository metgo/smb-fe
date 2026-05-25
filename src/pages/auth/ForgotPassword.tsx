import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import AuthHeader from "./AuthHeader";
import AuthInputField from "./AuthInputField";

import { useForgotPasswordMutation } from "@/store/api/authApi";

interface ForgotPasswordProps {
  setCurrentTab: (v: string) => void;
  setOtpToken: (v: string) => void;
}

export function ForgotPassword({
  setCurrentTab,
  setOtpToken,
}: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const { t } = useTranslation("login");

  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await forgotPassword({
        email,
        purpose: "forgetPassword",
      }).unwrap();
      toast.success(t("otp_sent"));
      setOtpToken(res?.token);
      setCurrentTab("otp");
    } catch (err: any) {
      toast.error(err?.data?.message || t("something_wrong"));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="mb-6 flex justify-start"></div>

          {/* Header */}
          <AuthHeader
            title="forgot_password"
            desc="no_account"
            btnText="sign_up_here"
            handleCurrentTabChange={() => setCurrentTab("register")}
          />

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <AuthInputField
              isRequired
              type="email"
              placeholder={t("enter_email")}
              value={email}
              onChange={setEmail}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-base sm:text-lg py-3.5 sm:py-4 transition-colors"
            >
              {isLoading ? t("sending") : t("send_otp")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
