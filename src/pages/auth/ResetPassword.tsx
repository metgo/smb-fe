import { toast } from "sonner";
import { useState } from "react";
import { useResetPasswordMutation } from "@/store/api/authApi";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/shared/LanguageSelector";

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
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          {/* Header */}
          <div className="mb-6 flex justify-start">
            <LanguageSelector />
          </div>
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setCurrentTab("otp")}
              className="text-white hover:text-gray-300 text-2xl transition-colors"
            >
              {t("back")}
            </button>
          </div>

          {/* Title */}
          <h1 className="text-4xl text-white mb-6">{t("reset_password")}</h1>

          <form onSubmit={handleResetPassword} className="space-y-6">
            <input
              type="password"
              placeholder={t("new_password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 rounded-xl"
              required
            />

            <input
              type="password"
              placeholder={t("confirm_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 rounded-xl"
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-lg py-4"
            >
              {isLoading ? t("resetting") : t("reset_password_button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
