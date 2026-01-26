import clsx from "clsx";
import { Outlet } from "react-router-dom";

import Header from "./header";
import Sidebar from "./sidebar";
import { useAppSelector } from "@/hooks/hooks";

const RootLayout = () => {
  const { isSidebarCollapsed } = useAppSelector((state) => state.ui);
  const { isRTL, theme } = useAppSelector((state) => state.settings);

  return (
    <main
      className={clsx(
        "min-h-screen transition-colors flex flex-col",
        theme === "dark" ? "bg-gray-950" : "bg-gray-50",
      )}
    >
      <Header />
      <div className=" pt-20 relative">
        <Sidebar />

        {/* Main Content Area - With left margin for fixed sidebar */}
        <div
          className={clsx(
            `flex-1 transition-all duration-300 py-4 px-4 sm:px-6 lg:px-8`,
            isRTL
              ? isSidebarCollapsed
                ? "mr-16"
                : "mr-64"
              : isSidebarCollapsed
                ? "ml-16"
                : "ml-64",
          )}
        >
          <Outlet />
          {/* Footer Credit */}
          <div className="mt-40 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Powered by{" "}
              <span className="text-teal-600 dark:text-teal-400">
                MetGo LTD.
              </span>
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              Contact support at{" "}
              <a
                href="mailto:support@metgo.app"
                className="text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors"
              >
                support@metgo.app
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RootLayout;
