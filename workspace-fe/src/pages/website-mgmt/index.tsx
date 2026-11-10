import clsx from "clsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Globe,
  LayoutGrid,
  Layers,
  MapPin,
  ShoppingBag,
  BadgePercent,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import EntityCardsSkeleton from "@/components/skeletons/EntityCardSkeleton";
import { ConfirmDialog, PageHeader } from "@/components/shared";
import WebsiteCard from "./components/WebsiteCard";
import WebsitePreviewModal from "./components/WebsitePreviewModal";
import {
  useUpdateWebsiteSettingMutation,
  useDeleteWebsiteMutation,
  useGetAllWebsiteListQuery,
} from "@/store/api/websiteConfigApi";
import { toast } from "sonner";

type PurposeFilter = "ALL" | IWebsiteListRes["purpose"];

interface PurposeTab {
  id: PurposeFilter;
  label: string;
  Icon: LucideIcon;
}

export default function WebsiteMgmtPage() {
  const { t } = useTranslation("website_settings");
  const { t: tc } = useTranslation("common");
  const navigate = useNavigate();
  const { language, isDark } = useThemeClasses();

  const {
    data: allWebsites,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllWebsiteListQuery(language);

  const [updateWebsiteSetting] = useUpdateWebsiteSettingMutation();
  const [deleteWebsite, { isLoading: isDeleting }] = useDeleteWebsiteMutation();

  const [activeTab, setActiveTab] = useState<PurposeFilter>("ALL");
  const [deleteTarget, setDeleteTarget] = useState<IWebsiteListRes | null>(
    null,
  );
  const [migrateTarget, setMigrateTarget] = useState<IWebsiteListRes | null>(
    null,
  );
  const [isMigrating, setIsMigrating] = useState(false);
  const [deactivateTarget, setDeactivateTarget] =
    useState<IWebsiteListRes | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<IWebsiteListRes | null>(
    null,
  );

  const purposeTabs: PurposeTab[] = [
    { id: "ALL", label: tc("all"), Icon: LayoutGrid },
    { id: "MARKETPLACE", label: t("purpose_marketplace"), Icon: ShoppingBag },
    { id: "TRAVELING", label: t("purpose_traveling"), Icon: MapPin },
    { id: "DISCOUNT", label: t("purpose_discount"), Icon: BadgePercent },
    { id: "OTHER", label: t("purpose_other"), Icon: Layers },
  ];

  const countFor = (id: PurposeFilter) =>
    id === "ALL"
      ? (allWebsites?.length ?? 0)
      : (allWebsites?.filter((w) => w.purpose === id).length ?? 0);

  const visibleWebsites =
    activeTab === "ALL"
      ? allWebsites
      : allWebsites?.filter((w) => w.purpose === activeTab);

  const handleToggleActive = async (websiteId: string, isActive: boolean) => {
    try {
      await updateWebsiteSetting({
        id: websiteId,
        body: { isActive },
      }).unwrap();
      toast.success(t("dmo_updated_success"));
      refetch();
    } catch {
      toast.error(t("dmo_update_failed"));
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) return;
    setIsDeactivating(true);
    try {
      await handleToggleActive(deactivateTarget._id, false);
    } finally {
      setIsDeactivating(false);
      setDeactivateTarget(null);
    }
  };

  const handleMigrateConfirm = async () => {
    if (!migrateTarget) return;
    setIsMigrating(true);
    try {
      console.log("migrate to prod", migrateTarget._id);
    } finally {
      setIsMigrating(false);
      setMigrateTarget(null);
    }
  };

  const handleConfigure = (website: IWebsiteListRes) => {
    navigate(
      `${routes.websiteConfig}?websiteId=${website._id}&websiteName=${encodeURIComponent(website.websiteName)}&websiteLogo=${encodeURIComponent(website.logo || "")}`,
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteWebsite(deleteTarget._id).unwrap();
      toast.success(tc("website_deleted"));
      refetch();
    } catch {
      toast.error(tc("website_delete_failed"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col h-full pt-10 md:pt-0">
      <PageHeader
        title={t("website_management")}
        h1Gradient="text-transparent bg-gradient-to-r from-teal-500 to-cyan-500"
        totalCount={allWebsites?.length}
        btnLabel={t("register_website")}
        onClick={() => navigate(routes.websiteConfig)}
      />

      {isLoading || isFetching ? (
        <EntityCardsSkeleton />
      ) : (
        <>
          {allWebsites?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Globe className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-1">
                {t("no_websites_found")}
              </p>
              <p className="text-sm text-gray-400">{t("no_websites_desc")}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Purpose tabs */}
              <div
                className={clsx(
                  "flex gap-1 overflow-x-auto border-b",
                  isDark ? "border-gray-700" : "border-gray-200",
                )}
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {purposeTabs.map(({ id, label, Icon }) => {
                  const count = countFor(id);
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={clsx(
                        "flex items-center gap-1.5 px-3 py-2 text-sm font-semibold whitespace-nowrap rounded-t-lg transition-colors cursor-pointer",
                        isActive
                          ? isDark
                            ? "bg-gray-800 text-teal-400 border-b-2 border-teal-500"
                            : "bg-gray-100 text-teal-700 border-b-2 border-teal-600"
                          : isDark
                            ? "text-gray-400 hover:text-gray-300 hover:bg-gray-800/50"
                            : "text-gray-600 hover:text-gray-700 hover:bg-gray-50",
                      )}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {label}
                      <span
                        className={clsx(
                          "text-xs px-1.5 py-0.5 rounded-full font-bold tabular-nums",
                          isActive
                            ? "bg-teal-500/20 text-teal-500"
                            : isDark
                              ? "bg-gray-700 text-gray-400"
                              : "bg-gray-200 text-gray-500",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Cards grid */}
              {visibleWebsites?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Globe className="w-10 h-10 mb-3 text-gray-300" />
                  <p className="text-sm text-gray-400">
                    {t("no_websites_found")}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 p-1">
                  {visibleWebsites?.map((website) => (
                    <WebsiteCard
                      key={website._id}
                      website={website}
                      onToggleActive={() =>
                        website.isActive
                          ? setDeactivateTarget(website)
                          : handleToggleActive(website._id, true)
                      }
                      onPreview={() => setPreviewTarget(website)}
                      onEdit={() => handleConfigure(website)}
                      onDelete={() => setDeleteTarget(website)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {previewTarget && (
        <WebsitePreviewModal
          websiteId={previewTarget._id}
          websiteName={previewTarget.websiteName}
          websiteLogo={previewTarget.logo}
          onClose={() => setPreviewTarget(null)}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="delete_website"
        message="delete_website_confirm"
        variant="danger"
        confirmText="delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        title="deactivate_website"
        message="deactivate_website_confirm"
        variant="warning"
        confirmText="deactivate"
        loading={isDeactivating}
        onConfirm={handleDeactivateConfirm}
        onCancel={() => setDeactivateTarget(null)}
      />

      <ConfirmDialog
        open={!!migrateTarget}
        title="migrate_website_to_prod"
        message="migrate_website_to_prod_confirm"
        variant="warning"
        confirmText="migrate_to_prod"
        loading={isMigrating}
        onConfirm={handleMigrateConfirm}
        onCancel={() => setMigrateTarget(null)}
      />
    </div>
  );
}
