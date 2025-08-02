"use client";

import { useEffect, useState } from "react";
import { Logo } from "../ui/icons";

const InitilaLoadScreen = () => (
  <main className="h-screen w-full flex items-center justify-center bg-white absolute top-0 left-0">
    <div>
      <Logo />
    </div>
  </main>
);

const AppLoaderWrapper = ({ children }: { children: React.ReactNode }) => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  return showLoader ? <InitilaLoadScreen /> : <>{children}</>;
};

export default AppLoaderWrapper;
