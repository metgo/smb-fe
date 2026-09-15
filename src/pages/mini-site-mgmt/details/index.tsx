import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { Edit } from "lucide-react";

import { routes } from "@/lib/routes";
import { miniSiteTabs } from "@/constants/tabs";
import { BackToListBtn } from "@/components/btns";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { Spinner, TabsSection } from "@/components/shared";
import { DetailTitleSection } from "@/components/details-sections";
import { useGetMiniSiteByIdQuery } from "@/store/api/miniSiteQueryApi";

import MiniOverviewSection from "./components/MiniOverviewSection";
import MinisitePreviewSection from "./components/MinisitePreviewSection";
import MinisiteCreateWizard from "../components/CreateMinisiteWizard";

type TabId = (typeof miniSiteTabs)[number]["id"];

export default function MiniSiteDetailsPage() {
  const { t } = useTranslation("minisites");
  const { isDark, textPrimary, textSecondary, borderColor, bgPrimary } =
    useThemeClasses();
  // const { userRole } = useAppSelector((state) => state.auth);

  const [searchParams] = useSearchParams();
  const miniSiteId = searchParams.get("miniSiteId") ?? "";

  const {
    data: miniSite,
    isLoading,
    isFetching,
    refetch,
  } = useGetMiniSiteByIdQuery(miniSiteId ? { miniSiteId } : skipToken);

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isEditClicked, setIsEditClicked] = useState(false);

  // const canEdit = ["superadmin", "admin"].includes(userRole);

  const renderContent = () => {
    const commonProps = {
      miniSite,
      t,
      isDark,
      textPrimary,
      textSecondary,
      borderColor,
    };

    switch (activeTab) {
      case "overview":
        return <MiniOverviewSection {...commonProps} />;
      case "preview":
        return <MinisitePreviewSection {...miniSite} />;
      default:
        return (
          <div className={clsx("py-16 text-center", textSecondary)}>
            {t("select_a_section")}
          </div>
        );
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
              {t("edit")}
            </button>
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
        <MinisiteCreateWizard
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
