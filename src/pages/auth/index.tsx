import { useState } from "react";
import { Login } from "./Login";
import { Signup } from "./Signup";

const AuthPage = () => {
  const [currentTab, setCurrentTab] = useState("login");

  return (
    <>
      {currentTab === "login" ? (
        <Login setCurrentTab={setCurrentTab} />
      ) : (
        <Signup setCurrentTab={setCurrentTab} />
      )}
    </>
  );
};

export default AuthPage;
