import { useThemeClasses } from "@/hooks/useThemeClasses";
import { VouchersList, CreateVoucherWizard } from "./components";
import { useGetAllCampaignsQuery } from "@/store/api/masterDataApi";
import { useState } from "react";

export default function VouchersMgmtPage() {
  const { isDark } = useThemeClasses();
  const { data: campaigns } = useGetAllCampaignsQuery({
    type: "CASH_IN",
  });

  const [showAddWizard, setShowAddWizard] = useState(false);

  const handleAddVoucher = () => {
    setShowAddWizard(true);
  };

  const handleCloseAddWizard = () => {
    setShowAddWizard(false);
  };

  return (
    <div
      className={`h-[calc(108vh-180px)] transition-colors flex flex-col ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      <VouchersList
        campaigns={campaigns}
        onAddVoucher={handleAddVoucher}
        showAddWizard={showAddWizard}
      />

      {/* Add Voucher Wizard Modal */}
      {showAddWizard && (
        <CreateVoucherWizard
          onClose={handleCloseAddWizard}
          campaigns={campaigns}
        />
      )}
    </div>
  );
}
