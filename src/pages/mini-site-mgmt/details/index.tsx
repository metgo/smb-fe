import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
// import { Edit } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Spinner, TabsSection } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
// import { useAppSelector } from "@/hooks/hooks";
import { BackToListBtn } from "@/components/btns";
import { routes } from "@/lib/routes";
import { skipToken } from "@reduxjs/toolkit/query";
import { miniSiteTabs } from "@/constants/tabs";
import { useGetMiniSiteByIdQuery } from "@/store/api/miniSiteQueryApi";

import MiniOverviewSection from "./components/MiniOverviewSection";
import MinisiteProductsSelect from "./components/MinisiteProductsSelect";
// import ContactSection from "./components/ContactSection";
// import LocationSection from "./components/LocationSection";
// import MediaSection from "./components/MediaSection";
// import SocialSection from "./components/SocialSection";

type TabId = (typeof miniSiteTabs)[number]["id"];

export default function MiniSiteDetailsPage() {
  const { t } = useTranslation("minisites");
  const { borderColor, isDark } = useThemeClasses();
  // const { userRole } = useAppSelector((state) => state.auth);

  const [searchParams] = useSearchParams();
  const miniSiteId = searchParams.get("miniSiteId") ?? "";

  const {
    data: miniSite,
    isLoading,
    isFetching,
    // refetch,
  } = useGetMiniSiteByIdQuery(miniSiteId ? { miniSiteId } : skipToken);

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isEditClicked, setIsEditClicked] = useState(false);

  // const canEdit = ["superadmin", "admin"].includes(userRole);

  const renderContent = () => {
    const commonProps = {
      miniSite,
      t,
      isDark,
      borderColor,
    };

    switch (activeTab) {
      case "overview":
        return <MiniOverviewSection {...commonProps} />;
      case "product":
        return <MinisiteProductsSelect {...commonProps} />;
      // case "location":  return <LocationSection {...commonProps} />;
      // case "media":     return <MediaSection {...commonProps} />;
      // case "social":    return <SocialSection {...commonProps} />;
      default:
        return (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            {t("select_a_section")}
          </div>
        );
    }
  };

  if (!miniSiteId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{t("mini_site_not_found")}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {t("no_mini_site_with_id", { id: miniSiteId })}
        </p>
        <BackToListBtn navPath={routes.miniSiteMgmt} />
      </div>
    );
  }

  return (
    <div className="flex flex-col overflow-hidden relative min-h-screen">
      <Spinner isLoading={isLoading || isFetching} />

      {/* Header / Controls Bar – same style as BusinessDetailsPage */}
      <div className={clsx("shrink-0 border-b px-6 py-5", borderColor)}>
        {/* Top row: Back + Actions */}
        <div className="flex items-center justify-between mb-5">
          <BackToListBtn navPath={routes.miniSiteMgmt} />

          <div className="flex items-center gap-3">
            {/* {canEdit && (
              <button
                onClick={() => setIsEditClicked(true)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-white font-medium transition-colors flex items-center gap-2 shadow-sm",
                  "bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500",
                )}
              >
                <Edit className="w-4 h-4" />
                {t("edit")}
              </button>
            )} */}
          </div>
        </div>

        {/* Mini-site title + basic info (replaces MiniSiteHeader) */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            {miniSite?.name || "-"}
          </h1>
          {miniSite?.tagline && (
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
              {miniSite.tagline}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            {miniSite?.category && (
              <div>
                <span className="font-medium">{t("category")}: </span>
                {miniSite.category}
              </div>
            )}
            {miniSite?.createdAt && (
              <div>
                <span className="font-medium">{t("created")}: </span>
                {new Date(miniSite.createdAt).toLocaleDateString()}
              </div>
            )}
            {/* Add more inline fields if useful: owner, status, etc. */}
          </div>
        </div>

        {/* Tabs */}
        <TabsSection
          t={t}
          tabs={miniSiteTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>

      {/* Edit wizard overlay (placeholder – replace with your real wizard) */}
      {isEditClicked && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{t("edit_mini_site")}</h2>
                <button
                  onClick={() => setIsEditClicked(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              <p className="mb-6 text-gray-600 dark:text-gray-300">
                Editing mini-site: <strong>{miniSite?.name}</strong> (ID:{" "}
                {miniSiteId})
              </p>
              {/* <MinisiteCreateWizard
                editData={miniSite}
                currentView="edit"
                onClose={() => setIsEditClicked(false)}
                onSuccess={() => {
                  setIsEditClicked(false);
                  refetch();
                }}
              /> */}
              {/* Temporary placeholder content */}
              <div className="py-12 text-center text-gray-500">
                Wizard placeholder – implement MinisiteCreateWizard here
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
