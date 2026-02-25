import { toast } from "sonner";
import { useState } from "react";
import { useVerifyOtpMutation } from "@/store/api/authApi";
import { useTranslation } from "react-i18next";
import AuthInputField from "./AuthInputField";
import AuthHeader from "./AuthHeader";

interface EnterOtpProps {
  setCurrentTab: (v: string) => void;
  otpToken: string;
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
          <AuthHeader title="enter_otp" desc="otp_instruction" />

          <form onSubmit={handleSubmitOtp} className="space-y-6">
            <AuthInputField
              value={otp}
              onChange={setOtp}
              placeholder={t("enter_otp_placeholder")}
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
