import { useCallback, useState } from "react";
import { VouchersList } from "./components/VouchersList";
import { VoucherDetails } from "./components/VoucherDetails";
import { AddVoucherWizard } from "./components/AddVoucherWizard";
import { useNavigate } from "react-router-dom";
import { routes } from "@/lib/routes";

export default function VouchersMgmtPage() {
  const [selectedVoucherId, setSelectedVoucherId] = useState<string | null>(
    null,
  );
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const handleVoucherUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // const handleVoucherClick = (voucherId: string) => {
  //   setSelectedVoucherId(voucherId);
  // };
  const handleVoucherClick = useCallback(
    (voucher: any) => {
      navigate(`${routes.voucherDetails}?voucherId=${voucher?.id}`, {
        replace: true,
      });
    },
    [navigate],
  );
  const handleCloseDetails = () => {
    setSelectedVoucherId(null);
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Always mounted, visibility controlled */}
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
          />
        </div>

        {/* Detail View - Conditional rendering for detail view */}
        {selectedVoucherId && (
          <VoucherDetails
            voucherId={selectedVoucherId}
            // language={language}
            // theme={theme}
            onClose={handleCloseDetails}
            onVoucherUpdated={handleVoucherUpdated}
          />
        )}
      </div>

      {/* Add Voucher Wizard Modal */}
      {showAddWizard && (
        <AddVoucherWizard
          // language={language}
          // theme={theme}
          onClose={handleCloseAddWizard}
          onVoucherCreated={handleVoucherCreated}
        />
      )}
    </div>
  );
}
