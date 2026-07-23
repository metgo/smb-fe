import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { VendorMonthlyReport } from "./components/sub-components/VendorMonthlyReport";

export const VendorReconciliationMgmt = () => {
  const { isDark } = useThemeClasses();

  return (
    <div
      className={clsx(
        "transition-colors flex flex-col min-h-screen",
        isDark ? "" : "bg-gray-50",
      )}
    >
      <VendorMonthlyReport />
    </div>
  );
};
