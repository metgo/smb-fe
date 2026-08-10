import clsx from "clsx";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { VendorMonthlyReport } from "./components/sub-components/VendorMonthlyReport";

export const VendorReconciliationMgmt = () => {
  const { isDark } = useThemeClasses();

  return (
    <div className={clsx("", isDark ? "" : "bg-gray-50")}>
      <VendorMonthlyReport />
    </div>
  );
};
