import { useState } from "react";
import { Login } from "./Login";
import { Signup } from "./Signup";
import { ForgotPassword } from "./ForgotPassword";
import { EnterOtp } from "./EnterOtp";

const AuthPage = () => {
  const [currentTab, setCurrentTab] = useState("login");

  return (
    <>
      {currentTab === "login" ? (
        <Login setCurrentTab={setCurrentTab} />
      ) : currentTab === "register" ? (
        <Signup setCurrentTab={setCurrentTab} />
      ) : currentTab === "forgotPassword" ? (
        <ForgotPassword setCurrentTab={setCurrentTab} />
      ) : currentTab === "otp" ? (
        <EnterOtp token="" setCurrentTab={setCurrentTab} />
      ) : null}
    </>
  );
};

export default AuthPage;
