// VouchersMgmtPage.tsx
import { useState } from "react";
import { VouchersList, CreateVoucherWizard } from "./components";
import { useGetAllCampaignsQuery } from "@/store/api/masterDataApi";

export default function VouchersMgmtPage() {
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
    <>
      <div className="flex flex-col pt-4 md:pt-0 gap-3 relative">
        <VouchersList
          campaigns={campaigns}
          onAddVoucher={handleAddVoucher}
          showAddWizard={showAddWizard}
        />
      </div>

      {showAddWizard && (
        <CreateVoucherWizard
          onClose={handleCloseAddWizard}
          campaigns={campaigns}
        />
      )}
    </>
  );
}
