import clsx from "clsx";
import { useState } from "react";
import { toast } from "sonner";
import { Globe, Megaphone } from "lucide-react";

import { useCommon } from "@/hooks/useCommon";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog, EntityCard, PageHeader } from "@/components/shared";
import { useGetAllCampaignsQuery } from "@/store/api/websiteConfigApi";
import EntityCardsSkeleton from "@/components/skeletons/EntityCardSkeleton";

const ALL_TAB = "__all__";

const CampaignsMgmtPage = () => {
  const { allWebsites } = useCommon();
  const {
    data: campaigns,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllCampaignsQuery();
  const { bgPrimary, isDark, textTertiary } = useThemeClasses();

  const [activeTab, setActiveTab] = useState<string>(ALL_TAB);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const allCampaigns = campaigns ?? [];

  const countForWebsite = (websiteId: string) =>
    allCampaigns?.filter((c) => c.externalApiId === websiteId).length;

  const visibleCampaigns =
    activeTab === ALL_TAB
      ? allCampaigns
      : allCampaigns.filter((c) => c.externalApiId === activeTab);

  const handleToggleActive = async (campaign: ICampaignRes) => {
    try {
      // TODO: call update mutation when available
      toast.success(
        `Campaign ${campaign.isActive ? "deactivated" : "activated"}`,
      );
      refetch();
    } catch {
      toast.error("Failed to update campaign");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // TODO: call delete mutation when available
      toast.success("Campaign deleted successfully");
      refetch();
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const activeWebsite = (allWebsites ?? []).find((w) => w._id === activeTab);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className={clsx("sticky top-0 z-10", bgPrimary)}>
        <PageHeader
          title="Campaign Management"
          h1Gradient="text-transparent bg-gradient-to-r from-violet-500 to-purple-500"
          totalCount={visibleCampaigns.length}
        />

        {/* Tabs */}
        <div
          className={clsx(
            "flex gap-1 border-b overflow-x-auto",
            isDark ? "border-gray-700" : "border-gray-200",
          )}
          style={
            {
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            } as React.CSSProperties
          }
        >
          {/* All tab */}
          <button
            onClick={() => setActiveTab(ALL_TAB)}
            className={clsx(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors border-b-2 -mb-px",
              activeTab === ALL_TAB
                ? isDark
                  ? "border-violet-500 text-violet-400"
                  : "border-violet-600 text-violet-700"
                : isDark
                  ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            )}
          >
            <Globe className="w-4 h-4" />
            <span>All</span>
            <span
              className={clsx(
                "ml-0.5 px-1.5 py-0.5 text-xs rounded-full font-semibold",
                activeTab === ALL_TAB
                  ? isDark
                    ? "bg-violet-500/20 text-violet-300"
                    : "bg-violet-100 text-violet-700"
                  : isDark
                    ? "bg-gray-700 text-gray-400"
                    : "bg-gray-100 text-gray-500",
              )}
            >
              {allCampaigns.length}
            </span>
          </button>

          {(allWebsites ?? [])?.map((website) => {
            const isActive = activeTab === website._id;
            const count = countForWebsite(website._id);
            return (
              <button
                key={website._id}
                onClick={() => setActiveTab(website._id)}
                className={clsx(
                  "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors border-b-2 -mb-px",
                  isActive
                    ? isDark
                      ? "border-violet-500 text-violet-400"
                      : "border-violet-600 text-violet-700"
                    : isDark
                      ? "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
                )}
              >
                {website.logo ? (
                  <img
                    src={website.logo}
                    alt={website.name}
                    className="w-6 h-6 object-contain rounded-sm"
                  />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                <span>{website.name}</span>
                <span
                  className={clsx(
                    "ml-0.5 px-1.5 py-0.5 text-xs rounded-full font-semibold",
                    isActive
                      ? isDark
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-violet-100 text-violet-700"
                      : isDark
                        ? "bg-gray-700 text-gray-400"
                        : "bg-gray-100 text-gray-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* <Spinner isLoading={} /> */}

      <div className="mt-4 flex-1">
        {isLoading || isFetching ? (
          <EntityCardsSkeleton count={10} />
        ) : (
          <>
            {visibleCampaigns.length === 0 && (!isLoading || !isFetching) ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Megaphone className="w-12 h-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-1">No campaigns found</p>
                <p className="text-sm text-gray-400">
                  {activeTab === ALL_TAB
                    ? "No campaigns available."
                    : "No campaigns for this website."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
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
                    onEdit={() => console.log("edit", campaign._id)}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Campaign"
        message="Are you sure you want to delete this campaign? This action cannot be undone."
        variant="danger"
        confirmText="Delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default CampaignsMgmtPage;
