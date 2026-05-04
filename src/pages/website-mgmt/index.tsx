import clsx from "clsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, ExternalLink,  } from "lucide-react";

import { useAppSelector } from "@/hooks/hooks";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog, PageHeader, EntityCard } from "@/components/shared";
import { routes } from "@/lib/routes";

export default function WebsiteMgmtPage() {
  const navigate = useNavigate();
  const { associatedWebsite } = useAppSelector((state) => state.auth);
  const { textTertiary } = useThemeClasses();

  const [deleteTarget, setDeleteTarget] = useState<IWebsite | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [migrateTarget, setMigrateTarget] = useState<IWebsite | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  const handleMigrateToProd = (website: IWebsite) => {
    setMigrateTarget(website);
  };

  const handleToggleActive = (website: IWebsite) => {
    // TODO: call toggle active mutation
    console.log("toggle active", website._id, !website.isActive);
  };

  const handleMigrateConfirm = async () => {
    if (!migrateTarget) return;
    setIsMigrating(true);
    try {
      // TODO: call migrate mutation
      console.log("migrate to prod", migrateTarget._id);
    } finally {
      setIsMigrating(false);
      setMigrateTarget(null);
    }
  };

  const handleConfigure = (website: IWebsite) => {
    navigate(
      `${routes.websiteConfig}?websiteId=${website._id}&websiteName=${encodeURIComponent(website.name)}&websiteLogo=${encodeURIComponent(website.logo || "")}`,
    );
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // TODO: call delete mutation
      console.log("delete", deleteTarget._id);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Website Management"
        h1Gradient="text-transparent bg-gradient-to-r from-teal-500 to-cyan-500"
        totalCount={associatedWebsite.length}
        btnLabel="Register new website"
        onClick={() => navigate(routes.websiteConfig)}
      />

      {associatedWebsite.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Globe className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-1">No websites found</p>
          <p className="text-sm text-gray-400">
            No associated websites for your account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
          {associatedWebsite.map((website) => (
            <EntityCard
              key={website._id}
              logo={website.logo}
              name={website.name}
              fallbackIcon={<Globe className="w-12 h-12 text-gray-400" />}
              isActive={website.isActive ?? false}
              onToggleActive={() => handleToggleActive(website)}
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
