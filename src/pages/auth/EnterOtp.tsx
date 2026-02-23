import { toast } from "sonner";
import { useState } from "react";
import { useVerifyOtpMutation } from "@/store/api/authApi";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/shared/LanguageSelector";

interface EnterOtpProps {
  setCurrentTab: (v: string) => void;
  otpToken: string; // token returned from forgot password request
}

export function EnterOtp({ setCurrentTab, otpToken }: EnterOtpProps) {
  const [otp, setOtp] = useState<string>("");
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const token = otpToken;
  const { t } = useTranslation("login");

  const handleSubmitOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const payload = { code: otp, token };
      await verifyOtp(payload).unwrap();

      toast.success(t("otp_verified"));
      setCurrentTab("reset"); // redirect to Reset Password page
    } catch (err: any) {
      toast.error(err?.data?.message || t("invalid_otp"));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex justify-start">
            <LanguageSelector />
          </div>

          {/* Title */}
          <h1 className="text-4xl text-white mb-2">{t("enter_otp")}</h1>
          <p className="text-white/80 mb-6">{t("otp_instruction")}</p>

          <form onSubmit={handleSubmitOtp} className="space-y-6">
            <input
              type="text"
              placeholder={t("enter_otp_placeholder")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg py-4 transition-colors"
            >
              {isLoading ? t("verifying") : t("verify_otp")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
