import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Clock, Shield } from "lucide-react";

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

interface RateLimitState {
  blockDurationMs: number;
  loginBlockedAt: string;
}

export function Login({ setCurrentTab }: LoginProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation("login");
  const { t: tt } = useTranslation("toast");
  const [login, { isLoading }] = useLoginMutation();

  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rateLimit, setRateLimit] = useState<RateLimitState>({
    blockDurationMs: 0,
    loginBlockedAt: "",
  });
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);

  // Calculate remaining time and progress
  useEffect(() => {
    if (rateLimit.blockDurationMs > 0 && rateLimit.loginBlockedAt) {
      const blockedAt = new Date(rateLimit.loginBlockedAt).getTime();
      const blockEndTime = blockedAt + rateLimit.blockDurationMs;

      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(0, blockEndTime - now);

        if (remaining <= 0) {
          setIsBlocked(false);
          setTimeRemaining(0);
          setRateLimit({ blockDurationMs: 0, loginBlockedAt: "" });
          return;
        }

        setTimeRemaining(remaining);
        setIsBlocked(true);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [rateLimit.blockDurationMs, rateLimit.loginBlockedAt]);

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const timeDisplay = useMemo(() => {
    if (!isBlocked) return null;
    return formatTimeRemaining(timeRemaining);
  }, [isBlocked, timeRemaining]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (isBlocked) {
      toast.error(tt("account_temporarily_locked"));
      return;
    }

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
      if (err?.data) {
        const rateLimitData = err.data;
        setRateLimit({
          blockDurationMs: rateLimitData?.blockDurationMs || 0,
          loginBlockedAt: rateLimitData?.loginBlockedAt || "",
        });

        if (
          rateLimitData?.blockDurationMs > 0 &&
          rateLimitData?.loginBlockedAt
        ) {
          setIsBlocked(true);
          const blockedAt = new Date(rateLimitData.loginBlockedAt).getTime();
          const remaining = Math.max(
            0,
            blockedAt + rateLimitData.blockDurationMs - Date.now(),
          );
          setTimeRemaining(remaining);
        }
      }
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

            {/* Rate Limit Warning with Progress Bar */}
            {isBlocked ? (
              <div className="space-y-3">
                <div
                  className={`
                  flex items-start gap-3 p-4 rounded-xl
                  bg-red-500/20 border border-red-400/30
                  backdrop-blur-sm
                `}
                >
                  <Shield className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-200 text-sm font-medium">
                      {t("rate_limit_message")}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-300" />
                        <span className="text-red-200 font-semibold">
                          {timeDisplay}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-right">
                  <button
                    type="button"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setCurrentTab("forgotPassword")}
                    disabled={isBlocked}
                  >
                    {t("forgot_password")}
                  </button>
                </div>

                <SubmitButton
                  loading={isLoading}
                  label={t("sign_in")}
                  className={`
                 w-full py-6 text-base sm:text-lg rounded-xl font-semibold
                  transition-all duration-300 relative overflow-hidden
                 bg-blue-500 hover:bg-blue-600 hover:shadow-lg
              `}
                  isDisabled={isBlocked || isLoading}
                />
              </>
            )}

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
