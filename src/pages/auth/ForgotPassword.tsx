import { toast } from "sonner";
import { useState } from "react";
import { useForgotPasswordMutation } from "@/store/api/authApi";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/shared/LanguageSelector";

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
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          <div className="mb-6 flex justify-start"></div>

          {/* Header */}
          <div className="mb-6 flex justify-start">
            <LanguageSelector />
          </div>
          <div className="flex items-center justify-start mb-8"></div>

          <div>
            {/* Title */}
            <h1 className="text-4xl text-white mb-2">{t("forgot_password")}</h1>

            {/* Signup Link */}
            <p className="text-white/80 text-left mb-6">
              {t("no_account")}{" "}
              <button
                onClick={() => setCurrentTab("register")}
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                {t("sign_up_here")}
              </button>
            </p>
          </div>

          <form onSubmit={handleForgotPassword} className="space-y-6">
            <input
              type="email"
              placeholder={t("enter_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg py-4 transition-colors"
            >
              {isLoading ? t("sending") : t("send_otp")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
