import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import AuthHeader from "./AuthHeader";
import { useResetPasswordMutation } from "@/store/api/authApi";
import AuthInputField from "./AuthInputField";

interface ResetPasswordProps {
  setCurrentTab: (v: string) => void;
  token: string | null;
}

export function ResetPassword({ setCurrentTab, token }: ResetPasswordProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { t } = useTranslation("login");

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      toast.error(t("session_expired"));
      setCurrentTab("forgot");
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t("passwords_not_match"));
      return;
    }

    try {
      await resetPassword({
        password,
        confirmPassword,
        token,
      }).unwrap();

      toast.success(t("reset_success"));
      setCurrentTab("login");
    } catch (err: any) {
      toast.error(err?.data?.message || t("reset_failed"));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl">
          <AuthHeader
            title="reset_password"
            btnText="back"
            handleCurrentTabChange={() => setCurrentTab("otp")}
          />

          <form onSubmit={handleResetPassword} className="space-y-6">
            <AuthInputField
              isRequired
              type="password"
              placeholder={t("new_password")}
              value={password}
              onChange={setPassword}
            />

            <AuthInputField
              isRequired
              type="password"
              placeholder={t("confirm_password")}
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-base sm:text-lg py-3.5 sm:py-4 transition-colors"
            >
              {isLoading ? t("resetting") : t("reset_password_button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
