import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Login } from "./Login";
import { ForgotPassword } from "./ForgotPassword";
import { EnterOtp } from "./EnterOtp";
import { ResetPassword } from "./ResetPassword";
import { Signup } from "./Signup";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const AuthPage = () => {
  const { isRTL } = useThemeClasses();
  const [currentTab, setCurrentTab] = useState("login");
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const tokenError = searchParams.get("tokenError");

  return (
    <div className="relative min-h-screen " dir={isRTL ? "rtl" : "ltr"}>
      {/* Token expired error banner */}
      {tokenError === "expired" && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            background: "#fef2f2",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: "12px 20px",
            color: "#dc2626",
            fontWeight: 500,
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            maxWidth: "90vw",
            textAlign: "center",
            wordBreak: "break-word",
          }}
        >
          This profile update link has expired.
        </div>
      )}

      {/* Auth Forms */}
      {currentTab === "login" ? (
        <Login setCurrentTab={setCurrentTab} />
      ) : currentTab === "register" ? (
        <Signup setCurrentTab={setCurrentTab} />
      ) : currentTab === "forgotPassword" ? (
        <ForgotPassword
          setCurrentTab={setCurrentTab}
          setOtpToken={setOtpToken}
        />
      ) : currentTab === "otp" ? (
        <EnterOtp setCurrentTab={setCurrentTab} otpToken={otpToken ?? ""} />
      ) : currentTab === "reset" ? (
        <ResetPassword setCurrentTab={setCurrentTab} token={otpToken} />
      ) : null}
    </div>
  );
};

export default AuthPage;
