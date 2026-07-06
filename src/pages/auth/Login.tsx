import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { routes } from "@/lib/routes";
import { useLoginMutation } from "@/store/api/authApi";
import ContinueWithGoogle from "./ContinueWithGoogle";
import { SubmitButton } from "@/components/btns";
import { useAppDispatch } from "@/hooks/hooks";
import { loginSuccess } from "@/features/authSlice";
import { UserRole } from "@/enums/user.types";

import AuthInputField from "./AuthInputField";
import AuthHeader from "./AuthHeader";

interface LoginProps {
  setCurrentTab: (v: string) => void;
}

export function Login({ setCurrentTab }: LoginProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation("login");
  const { t: tt } = useTranslation("toast");

  const [error] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const data = await login({
        email: username.trim(),
        password: password.trim(),
      }).unwrap();
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
      const savedRedirect = sessionStorage.getItem("redirect_after_login");
      if (savedRedirect) {
        sessionStorage.removeItem("redirect_after_login");
        navigate(savedRedirect, { replace: true });
      } else if (
        data.user.role === UserRole.TRAVELLER &&
        !data.user.hasBusiness
      ) {
        navigate(routes.businessMgmt, { replace: true });
      } else {
        navigate(routes.dashboard, { replace: true });
      }
    } catch (err: any) {
      toast.error(tt("login_failed"));
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-400 via-red-500 to-green-600 flex items-center justify-center p-4 sm:p-8 relative">
      <div className="w-full max-w-xl">
        <div className="bg-gray-800/40 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-2xl">
          {/* Logo & site name */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/20 border border-white/40 flex items-center justify-center mb-3 shadow-lg">
              <img
                src="/assets/images/metgologo.png"
                alt="Metgo"
                className="w-16 sm:w-24"
              />
            </div>
          </div>

          <AuthHeader
            title="sign_in"
            desc="no_account"
            btnText="sign_up_here"
            handleCurrentTabChange={() => setCurrentTab("register")}
          />

          <form onSubmit={handleLogin} className="space-y-6">
            <AuthInputField
              isRequired
              value={username}
              placeholder={t("username_email")}
              onChange={setUsername}
            />

            <AuthInputField
              isRequired
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
            />

            {error && <p className="text-red-300 text-sm">{error}</p>}

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
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-base sm:text-lg py-6"
            />

            <div className="text-center text-white/80">{t("or")}</div>
          </form>

          <div className="mt-4">
            <ContinueWithGoogle />
          </div>
        </div>
      </div>
    </div>
  );
}
