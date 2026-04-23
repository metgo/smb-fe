import { VendorMonthlyReport } from "./components/sub-components/VendorMonthlyReport";
import { useAppSelector } from "@/hooks/hooks";

export const VendorReconciliationMgmt = () => {
  return (
    <div className=" bg-gray-50 dark:bg-gray-950 transition-colors flex flex-col">
      <VendorMonthlyReport vendorId={""} adminView={""} />
    </div>
  );
};
