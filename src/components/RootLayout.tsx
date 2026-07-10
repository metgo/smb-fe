import clsx from "clsx";
import { Outlet } from "react-router-dom";

import Header from "./header";
import Sidebar from "./sidebar";
import { useAppSelector } from "@/hooks/hooks";
import RouterProgressBar from "./shared/RouterProgressBar";
import { useThemeClasses } from "@/hooks/useThemeClasses";

const RootLayout = () => {
  const { isSidebarCollapsed } = useAppSelector((state) => state.ui);
  const { isDark, isRTL } = useThemeClasses();

  return (
    <main
      className={clsx(
        "min-h-screen transition-colors flex flex-col",
        isDark ? "bg-gray-950" : "bg-gray-50",
      )}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <RouterProgressBar />
      <Header />
      <div className=" pt-14 md:pt-20 relative">
        <Sidebar />

        {/* Main Content Area - With left margin for fixed sidebar */}
        <div
          className={clsx(
            `flex-1 transition-all duration-300 py-4 px-2 sm:px-6 lg:px-8`,
            isRTL
              ? isSidebarCollapsed
                ? "lg:mr-16"
                : "lg:mr-64"
              : isSidebarCollapsed
                ? "lg:ml-16"
                : "lg:ml-64",
          )}
        >
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default RootLayout;
