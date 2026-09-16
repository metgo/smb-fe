import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";

import { routes } from "@/lib/routes";
import { miniSiteTabs } from "@/constants/tabs";
import { BackToListBtn } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Spinner, TabsSection } from "@/components/shared";
import {
  AuditInfoDetails,
  DetailTitleSection,
} from "@/components/details-sections";
import {
  useGetMiniSiteByIdQuery,
  useUpdateMiniSiteStatusMutation,
} from "@/store/api/miniSiteQueryApi";
import { CreateMinisiteWizard } from "../components";
import {
  MinisiteOverviewSection,
  MinisitePreviewSection,
  MinisiteVouchersList,
} from "./components";

type TabId = (typeof miniSiteTabs)[number]["id"];

const statusOptions = ["ACTIVE", "INACTIVE", "DRAFT", "EXPIRED"];

export default function MiniSiteDetailsPage() {
  const { t } = useTranslation("minisites");
  const { t: tc } = useTranslation("common");
  const {
    isDark,
    textPrimary,
    textSecondary,
    bgPrimary,
    borderColor,
    bgSecondary,
  } = useThemeClasses();

  const [searchParams] = useSearchParams();
  const miniSiteId = searchParams.get("miniSiteId") ?? "";

  const {
    data: miniSite,
    isLoading,
    isFetching,
    refetch,
  } = useGetMiniSiteByIdQuery(miniSiteId ? { miniSiteId } : skipToken);

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateMiniSiteStatusMutation();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isEditClicked, setIsEditClicked] = useState(false);

  const handleStatusChange = async (status: string) => {
    if (!miniSiteId || status === miniSite?.status) return;
    try {
      await updateStatus({ miniSiteId, status }).unwrap();
      toast.success(tc("status_updated") || "Status updated");
      refetch();
    } catch {
      toast.error(tc("status_update_failed") || "Failed to update status");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <MinisiteOverviewSection miniSite={miniSite} />;
      case "preview":
        return <MinisitePreviewSection {...miniSite} />;
      case "voucher_list":
        return <MinisiteVouchersList miniSiteId={miniSite?._id} />;
      case "audit_info":
        return (
          <AuditInfoDetails
            createdAt={miniSite?.createdAt}
            updatedAt={miniSite?.updatedAt}
            createdBy={miniSite?.createdBy}
            updatedBy={miniSite?.updatedBy}
          />
        );
      default:
        return null;
    }
  };

  if (!miniSiteId) {
    return (
      <div
        className={clsx(
          "flex flex-col items-center justify-center min-h-screen p-8 text-center",
          bgPrimary,
        )}
      >
        <h2 className={clsx("text-2xl font-bold mb-4", textPrimary)}>
          {t("mini_site_not_found")}
        </h2>
        <p className={clsx("mb-8", textSecondary)}>
          {t("no_mini_site_with_id", { id: miniSiteId })}
        </p>
        <BackToListBtn navPath={routes.miniSiteMgmt} />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex flex-col h-[calc(100vh-7rem)] overflow-hidden relative pt-10 md:pt-0",
        bgPrimary,
      )}
    >
      <Spinner isLoading={isLoading || isFetching} />

      <div className="details-top shrink-0">
        <DetailTitleSection
          name={miniSite?.name}
          createdAt={miniSite?.createdAt}
          updatedAt={miniSite?.updatedAt}
          imageSrc={miniSite?.logoPath}
          backPath={routes.miniSiteMgmt}
          actions={
            <div className="flex items-center gap-2">
              <select
                value={miniSite?.status ?? ""}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={isUpdatingStatus}
                className={clsx(
                  "px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500",
                  borderColor,
                  bgSecondary,
                  textPrimary,
                )}
                style={{ colorScheme: isDark ? "dark" : "light" }}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {tc(status.toLowerCase())}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsEditClicked(true)}
                className={clsx(
                  "px-3 py-2 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer text-sm font-medium",
                  isDark
                    ? "border-gray-700 hover:bg-gray-800 text-teal-400 bg-gray-900"
                    : "border-gray-300 hover:bg-gray-100 text-teal-700 bg-white",
                )}
              >
                <Edit className="w-4 h-4" />
                {tc("edit")}
              </button>
            </div>
          }
        />
      </div>

      {/* Content */}
      <div className="mt-1 flex flex-col flex-1 min-h-0">
        <div className="shrink-0">
          <TabsSection
            tabs={miniSiteTabs}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="details-content flex-1 overflow-y-auto min-h-0 p-2!">
          {renderContent()}
        </div>
      </div>

      {isEditClicked && (
        <CreateMinisiteWizard
          editData={miniSite}
          onClose={() => {
            setIsEditClicked(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
