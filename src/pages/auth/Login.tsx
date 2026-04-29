import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useLoginMutation } from "@/store/api/authApi";
import ContinueWithGoogle from "./ContinueWithGoogle";
import { SubmitButton } from "@/components/btns";
import { useAppDispatch } from "@/hooks/hooks";
import { loginSuccess } from "@/features/authSlice";

import AuthInputField from "./AuthInputField";
import AuthHeader from "./AuthHeader";

interface LoginProps {
  setCurrentTab: (v: string) => void;
}

export function Login({ setCurrentTab }: LoginProps) {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("login");
  const { t: tt } = useTranslation("toast");

  const [error] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await login({ email: username, password }).unwrap();

      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          "user_info",
          JSON.stringify({ user: data.user }),
        );
        sessionStorage.setItem("access_token", data.accessToken);
        window.dispatchEvent(new Event("session:updated"));
      }

      dispatch(loginSuccess(data.user));

      toast.success(
        t("welcome_message", {
          firstName: data.user.firstName,
          lastName: data.user.lastName,
        }),
      );
    } catch (err: any) {
      toast.error(tt("login_failed"));
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-8 relative">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-12 shadow-2xl">
          <AuthHeader
            title="sign_in"
            desc="no_account"
            btnText="sign_up_here"
            handleCurrentTabChange={() => setCurrentTab("register")}
          />

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username/Email Input */}
            <AuthInputField
              isRequired
              value={username}
              placeholder={t("username_email")}
              onChange={setUsername}
            />

            {/* Password Input */}
            <AuthInputField
              isRequired
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
            />

            {/* Error Message */}
            {error && <p className="text-red-300 text-sm">{error}</p>}

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-yellow-400 hover:text-yellow-300 transition-colors"
                onClick={() => setCurrentTab("forgotPassword")}
              >
                {t("forgot_password")}
              </button>
            </div>

            <SubmitButton
              loading={isLoading}
              label={t("sign_in")}
              className="bg-blue-500  hover:bg-blue-600 text-white rounded-xl text-lg py-7"
            />

            {/* Divider */}
            <div className="text-center text-white/80">{t("or")}</div>
          </form>

          {/* Google Sign In */}
          <div className="mt-4">
            <ContinueWithGoogle />
          </div>
        </div>
      </div>
    </div>
  );
}
