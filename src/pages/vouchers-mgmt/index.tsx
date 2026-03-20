import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { VouchersList, CreateVoucherWizard } from "./components";
import { useGetAllCampaignsQuery } from "@/store/api/masterDataApi";

export default function VouchersMgmtPage() {
  const { isDark } = useThemeClasses();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: campaigns } = useGetAllCampaignsQuery({
    type: "CASH_IN",
  });

  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
    null,
  );
  const [showAddWizard, setShowAddWizard] = useState(false);

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

  return (
    <div
      className={`h-[calc(108vh-180px)]  transition-colors flex flex-col ${
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
            campaigns={campaigns}
            showAddWizard={showAddWizard}
          />
        </div>
      </div>

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
