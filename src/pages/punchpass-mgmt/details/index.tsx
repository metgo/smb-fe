import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import {
  PunchPassCataloguesDetails,
  PunchPassInfoDetails,
  PunchPassTradeDetails,
} from "./components";
import { routes } from "@/lib/routes";
import { punchPassTabs } from "@/constants/tabs";
import { IOpMode } from "@/enums/operation.types";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { StatusChangeBtn } from "@/components/btns";
import { Spinner, TabsSection } from "@/components/shared";
import {
  AuditInfoDetails,
  DetailTitleSection,
  MediaDetails,
} from "@/components/details-sections";
import {
  useGetPunchPassByIdQuery,
  useUpdatePunchPassMutation,
} from "@/store/api/punchPassApi";
import { CreatePunchPassWizard } from "../components";

const PunchPassDetailsPage = () => {
  const { t } = useTranslation("punch_pass");
  const { t: tc } = useTranslation("toast");

  const [searchParams] = useSearchParams();
  const punchPassId = searchParams.get("punchPassId") || "";

  const { bgPrimary, isDark, language } = useThemeClasses();

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const {
    data: punchPass,
    isLoading,
    isFetching,
    refetch,
  } = useGetPunchPassByIdQuery(
    punchPassId ? { punchPassId, language } : skipToken,
  );

  const [updatePunchPass] = useUpdatePunchPassMutation();

  const onStatusChangeHandler = async (status: string) => {
    const toastId = toast.loading(tc("punch_pass_status_change_loading"));
    try {
      await updatePunchPass({
        language,
        punchPassId,
        body: { status: status?.toUpperCase() },
      }).unwrap();
      refetch();
      toast.success(tc("punch_pass_status_update_success"), { id: toastId });
    } catch (error: any) {
      toast.error(error?.message || tc("punch_pass_status_update_failed"), {
        id: toastId,
      });
    }
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    refetch();
  };

  const images = punchPass?.images ?? [];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <PunchPassInfoDetails t={t} punchPass={punchPass} />;
      case "catalogues":
        return <PunchPassCataloguesDetails {...punchPass} />;
      case "media":
        return (
          <MediaDetails
            images={images.map((img) => ({
              image: img.image,
              isPrimary: img.isPrimary,
            }))}
          />
        );
      case "trades":
        return <PunchPassTradeDetails t={t} punchPassId={punchPassId} />;
      case "audit_info":
        return (
          <AuditInfoDetails
            createdAt={punchPass?.createdAt}
            updatedAt={punchPass?.updatedAt}
            createdBy={punchPass?.createdBy}
            updatedBy={punchPass?.updatedBy}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] overflow-hidden relative md:top-0">
      <Spinner isLoading={isLoading || isFetching} />

      {/* Title */}
      <div className="details-top shrink-0">
        <DetailTitleSection
          {...punchPass}
          imageSrc={
            images.find((img) => img.isPrimary)?.image || images[0]?.image
          }
          backPath={routes.punchPassMgmt}
          actions={
            <>
              <StatusChangeBtn
                handleStatusChange={onStatusChangeHandler}
                status={
                  (punchPass?.status?.toLowerCase() as TStatus) || "pending"
                }
              />
              <button
                onClick={() => setIsEditOpen(true)}
                className={clsx(
                  "px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 cursor-pointer text-sm font-medium",
                  isDark
                    ? "border-gray-700 hover:bg-gray-800 text-indigo-400 bg-gray-900"
                    : "border-gray-300 hover:bg-gray-100 text-indigo-600 bg-white",
                )}
              >
                <Edit className="w-4 h-4" />
                {t("edit")}
              </button>
            </>
          }
        />
      </div>

      {/* Tabs + scrollable content */}
      <div className="flex flex-col flex-1 min-h-0 mt-2">
        <div className="shrink-0">
          <TabsSection
            tabs={punchPassTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div
          className={clsx(
            "details-content flex-1 overflow-y-auto min-h-0",
            bgPrimary,
          )}
        >
          <div className="py-3 px-2">{renderContent()}</div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && punchPass && (
        <CreatePunchPassWizard
          onClose={handleCloseEdit}
          refetch={refetch}
          punchPass={punchPass}
          opMode={IOpMode.EDIT}
        />
      )}
    </div>
  );
};

export default PunchPassDetailsPage;
