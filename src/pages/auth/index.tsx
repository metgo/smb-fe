import { useState } from "react";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { ForgotPassword } from "./ForgotPassword";
import { EnterOtp } from "./EnterOtp";
import { ResetPassword } from "./ResetPassword";

const AuthPage = () => {
  const [currentTab, setCurrentTab] = useState("login");
  const [otpToken, setOtpToken] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen ">
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
