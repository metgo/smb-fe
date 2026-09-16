import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Megaphone, Plus } from "lucide-react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  ConfirmDialog,
  EntityCard,
  PageHeader,
  TabsSection,
} from "@/components/shared";
import { useGetAllCampaignsQuery } from "@/store/api/websiteConfigApi";
import {
  useDeleteCampaignMutation,
  useUpdateCampaignMutation,
} from "@/store/api/campaignApi";
import CreateCampaignWizard from "./components/CreateCampaignWizard";
import EntityCardsSkeleton from "@/components/skeletons/EntityCardSkeleton";

const ALL_TAB = "__all__";

const CampaignsMgmtPage = () => {
  const { t } = useTranslation("campaign");
  const { allWebsites } = useCommon();
  const {
    data: campaigns,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllCampaignsQuery();
  const { bgPrimary, isDark, textTertiary } = useThemeClasses();

  const [deleteCampaign] = useDeleteCampaignMutation();
  const [updateCampaign] = useUpdateCampaignMutation();

  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(
    null,
  );

  const allCampaigns = campaigns ?? [];

  const visibleCampaigns =
    activeTab === ALL_TAB
      ? allCampaigns
      : allCampaigns.filter((c) => c.externalApiId === activeTab);

  const handleToggleActive = async (campaign: ICampaignRes) => {
    try {
      await updateCampaign({
        id: campaign._id,
        body: { isActive: !campaign.isActive } as any,
      }).unwrap();
      toast.success(campaign.isActive ? t("deactivated") : t("activated"));
      refetch();
    } catch {
      toast.error(t("toggle_failed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCampaign(deleteTarget).unwrap();
      toast.success(t("deleted"));
      refetch();
    } catch {
      toast.error(t("delete_failed"));
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    setEditingCampaignId(null);
  };

  const handleEdit = (campaign: ICampaignRes) => {
    setEditingCampaignId(campaign._id);
    setShowWizard(true);
  };

  const activeWebsite = (allWebsites ?? []).find((w) => w._id === activeTab);

  const websiteTabs = [
    { id: ALL_TAB, label: t("all"), icon: Globe },
    ...(allWebsites ?? []).map((w) => ({
      id: w._id,
      label: w.name,
      icon: w.logo || Globe,
    })),
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto pt-10 md:pt-0">
      <div className={clsx("sticky top-0 z-10", bgPrimary)}>
        <PageHeader
          title={t("campaign_management")}
          h1Gradient="text-transparent bg-gradient-to-r from-violet-500 to-purple-500"
          totalCount={visibleCampaigns.length}
          btnLabel={t("new_campaign")}
          onClick={() => setShowWizard(true)}
        />

        <TabsSection
          tabs={websiteTabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      <div className="mt-4 flex-1">
        {isLoading || isFetching ? (
          <EntityCardsSkeleton count={10} />
        ) : (
          <>
            {visibleCampaigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Megaphone className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-1">
                  {t("no_campaigns_found")}
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  {activeTab === ALL_TAB
                    ? t("no_campaigns_available")
                    : t("no_campaigns_for_website")}
                </p>
                <button
                  onClick={() => setShowWizard(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  {t("create_first_campaign")}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 p-1">
                {visibleCampaigns.map((campaign) => (
                  <EntityCard
                    key={campaign._id}
                    logo={campaign.logoPath || campaign.imagePath}
                    name={campaign.name}
                    fallbackIcon={
                      <Megaphone className="w-12 h-12 text-gray-400" />
                    }
                    isActive={campaign.isActive ?? true}
                    onToggleActive={() => handleToggleActive(campaign)}
                    onEdit={() => handleEdit(campaign)}
                    onDelete={() => setDeleteTarget(campaign._id)}
                    onMigrateToProd={() => console.log("migrate", campaign._id)}
                  >
                    <div className="flex flex-col gap-1 mt-1">
                      {campaign.code && (
                        <span
                          className={clsx(
                            "text-xs font-mono",
                            isDark ? "text-gray-400" : "text-gray-500",
                          )}
                        >
                          #{campaign.code}
                        </span>
                      )}
                      {campaign.type && (
                        <span
                          className={clsx(
                            "self-start px-2 py-0.5 text-xs rounded-full font-medium",
                            isDark
                              ? "bg-violet-700/40 text-violet-300"
                              : "bg-violet-100 text-violet-700",
                          )}
                        >
                          {campaign.type}
                        </span>
                      )}
                      {campaign.description && (
                        <p
                          className={clsx(
                            "text-xs leading-relaxed line-clamp-2 mt-0.5",
                            textTertiary,
                          )}
                        >
                          {campaign.description}
                        </p>
                      )}
                      {activeWebsite && (
                        <div className="flex items-center gap-1 mt-1">
                          {activeWebsite.logo ? (
                            <img
                              src={activeWebsite.logo}
                              alt={activeWebsite.name}
                              className="w-4 h-4 object-contain"
                            />
                          ) : (
                            <Globe className="w-3.5 h-3.5 text-violet-500" />
                          )}
                          <span
                            className={clsx("text-xs truncate", textTertiary)}
                          >
                            {activeWebsite.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </EntityCard>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showWizard && (
        <CreateCampaignWizard
          onClose={handleWizardClose}
          refetch={refetch}
          campaignId={editingCampaignId ?? undefined}
          opMode={editingCampaignId ? "EDIT" : "CREATE"}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("delete_campaign")}
        message={t("delete_campaign_message")}
        variant="danger"
        confirmText={t("delete")}
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default CampaignsMgmtPage;
