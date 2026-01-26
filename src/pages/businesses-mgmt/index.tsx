import { useState } from "react";

import { useAppSelector } from "@/hooks/hooks";

import BusinessDetails from "./details";
import { BusinessesList, CreateBusinessWizard } from "./components";
import { useNavigate } from "react-router-dom";

type View = "list" | "details" | "create" | "edit";

export default function BusinessesMgmtPage() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<View>("list");
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const { theme } = useAppSelector((state) => state.settings);

  const handleBusinessClick = (business: any) => {
    setSelectedBusiness(business);
    navigate(`?businessId=${business?._id}&businessSlug=${business?.slug}`, {
      replace: true,
    });
    setCurrentView("details");
  };

  const handleCreateNew = () => {
    setSelectedBusiness(null);
    setCurrentView("create");
  };

  const handleEdit = () => {
    setCurrentView("edit");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedBusiness(null);
  };

  const handleCloseWizard = () => {
    setCurrentView("list");
    setSelectedBusiness(null);
  };

  const handleCreateProduct = () => {};

  return (
    <>
      {currentView === "list" && (
        <BusinessesList
          theme={theme}
          onBusinessClick={handleBusinessClick}
          onCreateNew={handleCreateNew}
        />
      )}

      {currentView === "details" && selectedBusiness && (
        <BusinessDetails
          onEdit={handleEdit}
          onBack={handleBackToList}
          onCreateProduct={handleCreateProduct}
        />
      )}

      {(currentView === "create" || currentView === "edit") && (
        <CreateBusinessWizard onClose={handleCloseWizard} />
      )}
    </>
  );
}
