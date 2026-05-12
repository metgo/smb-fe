import clsx from "clsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Globe, ExternalLink } from "lucide-react";

import { routes } from "@/lib/routes";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import EntityCardsSkeleton from "@/components/skeletons/EntityCardSkeleton";
import { ConfirmDialog, PageHeader, EntityCard } from "@/components/shared";
import {
  useGetAllWebsitesQuery,
  useUpdateWebsiteSettingMutation,
  useDeleteWebsiteMutation,
} from "@/store/api/websiteConfigApi";
import { toast } from "sonner";

export default function WebsiteMgmtPage() {
  const { t } = useTranslation("website_settings");
  const { t: tc } = useTranslation("common");
  const navigate = useNavigate();
  const { textTertiary } = useThemeClasses();

  const {
    data: allWebsites,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllWebsitesQuery();
  const [updateWebsiteSetting] = useUpdateWebsiteSettingMutation();
  const [deleteWebsite, { isLoading: isDeleting }] = useDeleteWebsiteMutation();

  const [deleteTarget, setDeleteTarget] = useState<IWebsiteRes | null>(null);
  const [migrateTarget, setMigrateTarget] = useState<IWebsiteRes | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [deactivateTarget, setDeactivateTarget] = useState<IWebsiteRes | null>(
    null,
  );
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleMigrateToProd = (website: IWebsiteRes) => {
    setMigrateTarget(website);
  };

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

  const handleConfigure = (website: IWebsiteRes) => {
    navigate(
      `${routes.websiteConfig}?websiteId=${website._id}&websiteName=${encodeURIComponent(website.websiteName)}&websiteLogo=${encodeURIComponent(website.logoUrl || "")}`,
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
    <div className="flex flex-col h-full">
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
          {allWebsites?.length === 0 && (!isLoading || !isFetching) ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Globe className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-1">
                {t("no_websites_found")}
              </p>
              <p className="text-sm text-gray-400">{t("no_websites_desc")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
              {allWebsites?.map((website) => (
                <EntityCard
                  key={website._id}
                  logo={website.logoUrl}
                  name={website.websiteName}
                  fallbackIcon={<Globe className="w-12 h-12 text-gray-400" />}
                  isActive={website.isActive ?? false}
                  onToggleActive={() =>
                    website.isActive
                      ? setDeactivateTarget(website)
                      : handleToggleActive(website._id, true)
                  }
                  onEdit={() => handleConfigure(website)}
                  onDelete={() => setDeleteTarget(website)}
                  onMigrateToProd={() => handleMigrateToProd(website)}
                >
                  {website.websiteUrl && (
                    <a
                      href={website.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={clsx(
                        "flex items-center gap-1 text-xs truncate hover:underline",
                        textTertiary,
                      )}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={11} />
                      {website.websiteUrl}
                    </a>
                  )}
                </EntityCard>
              ))}
            </div>
          )}
        </>
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
