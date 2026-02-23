import { toast } from "sonner";
import { useState } from "react";

import { routes } from "@/lib/routes";
import { useLoginMutation } from "@/store/api/authApi";
import ContinueWithGoogle from "./ContinueWithGoogle";
import { SubmitButton } from "@/components/btns";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks/hooks";
import { loginSuccess } from "@/features/authSlice";
import { UserRole } from "@/enums/user.types";

import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { useTranslation } from "react-i18next";

interface LoginProps {
  setCurrentTab: (v: string) => void;
}

export function Login({ setCurrentTab }: LoginProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation("login");

  const { t: tt } = useTranslation("toast");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const data = await login({ email: username, password }).unwrap();
      if (typeof window !== "undefined") {
        localStorage.setItem("user_info", JSON.stringify({ user: data.user }));
        localStorage.setItem("access_token", data.accessToken);
      }
      dispatch(loginSuccess(data.user));

      if (data?.user?.role === UserRole.TRAVELLER && !data?.user?.hasBusiness) {
        navigate(routes.businessMgmt, { replace: true });
      } else {
        navigate(routes.dashboard, { replace: true });
      }
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
          {/* Header */}
          <div className="mb-6 flex justify-start ">
            <LanguageSelector />
          </div>

          {/* Title */}
          <h1 className="text-4xl text-white mb-4 mt-20 ">{t("sign_in")}</h1>

          {/* Subtitle */}
          <p className="text-white/80 mb-8">
            {t("no_account")}{" "}
            <button
              onClick={() => setCurrentTab("register")}
              className="text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
            >
              {t("sign_up_here")}
            </button>
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username/Email Input */}
            <input
              type="text"
              placeholder={t("username_email")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Password Input */}
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-white/90 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
