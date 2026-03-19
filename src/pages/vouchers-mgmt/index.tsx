import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { routes } from "@/lib/routes";
import { VouchersList,  } from "./components";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { VoucherDetailsPage } from "./details/VoucherDetailsPage";
import { AddVoucherWizard } from "./components/CreateVoucherWizard";
import { useGetAllCampaignsQuery } from "@/store/api/masterDataApi";


export default function VouchersMgmtPage() {
  const { isDark } = useThemeClasses();
  const { data: campaigns } = useGetAllCampaignsQuery({
    type: "CASH_IN",
  });

  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
    null,
  );
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const navigate = useNavigate();

  const handleVoucherUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const voucherId = searchParams.get("voucherId");
    if (voucherId) setSelectedVoucherId(voucherId);
  }, [searchParams]);

  const handleVoucherClick = useCallback(
    (voucher: any) => {
      navigate(`${routes.voucherDetails}?voucherId=${voucher?._id}`, {
        replace: true,
      });
    },
    [navigate],
  );

  const handleAddVoucher = () => {
    setShowAddWizard(true);
  };

  const handleCloseAddWizard = () => {
    setShowAddWizard(false);
  };

  const handleVoucherCreated = () => {
    setShowAddWizard(false);
    handleVoucherUpdated();
  };

  return (
    <div
      className={`min-h-screen transition-colors flex flex-col ${
        isDark ? "bg-gray-950" : "bg-gray-50"
      }`}
    >
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div
          className={selectedVoucherId ? "hidden" : "flex-1"}
          style={{
            display: selectedVoucherId ? "none" : "flex",
            flexDirection: "column",
          }}
        >
          <VouchersList
            onVoucherClick={handleVoucherClick}
            onAddVoucher={handleAddVoucher}
            refreshTrigger={refreshTrigger}
            campaigns={campaigns}
          />
        </div>

        {/* Detail View */}
        {selectedVoucherId && <VoucherDetailsPage />}
      </div>

      {/* Add Voucher Wizard Modal */}
      {showAddWizard && (
        <AddVoucherWizard
          onClose={handleCloseAddWizard}
          onVoucherCreated={handleVoucherCreated}
          campaigns={campaigns}
        />
      )}
    </div>
  );
}
