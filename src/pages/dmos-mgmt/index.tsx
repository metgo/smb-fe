import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Building2, ArrowRight, Users } from "lucide-react";

import { routes } from "@/lib/routes";
import { CreateDmoWizardModal } from "./components";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import {
  ConfirmDialog,
  PageHeader,
  EntityCard,
  Spinner,
} from "@/components/shared";
import {
  useGetAllDmosQuery,
  useUpdateDmoMutation,
  useDeleteDmoMutation,
} from "@/store/api/websiteConfigApi";
import EntityCardsSkeleton from "@/components/skeletons/EntityCardSkeleton";

const DmosMgmtPage = () => {
  const { t } = useTranslation("website_settings");
  const { t: tc } = useTranslation("common");
  const navigate = useNavigate();
  const { textTertiary } = useThemeClasses();
  const [updateDmo, { isLoading: isUpdating }] = useUpdateDmoMutation();
  const [deleteDmo, { isLoading: isDeleting }] = useDeleteDmoMutation();

  const { data: dmos, refetch, isFetching, isLoading } = useGetAllDmosQuery();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [migrateTarget, setMigrateTarget] = useState<IDmo | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editDmoId, setEditDmoId] = useState<string | undefined>();

  const handleEdit = (dmoId: string) => {
    setEditDmoId(dmoId);
    setIsCreateModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDmo(deleteTarget).unwrap();
      toast.success(tc("dmo_deleted"));
      refetch();
    } catch {
      toast.error(tc("dmo_delete_failed"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleGoToAuthorities = (dmoId: string) => {
    navigate(`${routes.authorityMgmt}?dmoId=${dmoId}`);
  };

  const handleMigrateToProd = (dmoId: string) => {
    console.log("🚀 ~ handleMigrateToProd ~ dmoId:", dmoId);
    // setMigrateTarget(dmo);
  };

  const handleToggleActive = async (
    dmoId: string,
    isActive: boolean = false,
  ) => {
    try {
      await updateDmo({ id: dmoId, body: { isActive: isActive } }).unwrap();
      toast.success(t("dmo_updated_success"));
      refetch();
    } catch {
      toast.error(dmoId ? t("dmo_update_failed") : t("dmo_create_failed"));
    }
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

  return (
    <div className="flex flex-col h-full pt-10 md:pt-0">
      <PageHeader
        title={t("dmo_management")}
        h1Gradient="text-transparent bg-gradient-to-r from-teal-500 to-cyan-500"
        totalCount={dmos?.length}
        btnLabel={t("add_dmo")}
        onClick={() => setIsCreateModalOpen(true)}
      />
      <Spinner isLoading={isUpdating} />
      {isLoading || isFetching ? (
        <EntityCardsSkeleton count={9} />
      ) : (
        <>
          {dmos?.length === 0 && (!isFetching || !isLoading) ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Building2 className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-1">{t("no_dmos_found")}</p>
              <p className="text-sm text-gray-400">{t("add_dmo_desc")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-4 p-1">
              {dmos?.map((dmo) => {
                return (
                  <EntityCard
                    key={dmo._id}
                    logo={dmo.logoPath}
                    name={dmo.name}
                    fallbackIcon={
                      <Building2 className="w-12 h-12 text-gray-400" />
                    }
                    isActive={dmo?.isActive ?? false}
                    onToggleActive={() =>
                      handleToggleActive(dmo?._id, !dmo?.isActive)
                    }
                    onEdit={() => handleEdit(dmo?._id)}
                    onDelete={() => setDeleteTarget(dmo?._id)}
                    onMigrateToProd={() => handleMigrateToProd(dmo?._id)}
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-teal-500" />
                      <span
                        className={clsx("text-xs font-medium", textTertiary)}
                      >
                        {dmo?.authorityCount}{" "}
                        {dmo?.authorityCount === 1
                          ? t("authority_label")
                          : t("authorities_label")}
                      </span>
                      <button
                        title={t("view_authorities")}
                        onClick={() => handleGoToAuthorities(dmo?._id)}
                        className="p-1 rounded-md text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 transition-colors cursor-pointer"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </EntityCard>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="delete_dmo"
        message="delete_dmo_confirm"
        variant="danger"
        confirmText="delete"
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!migrateTarget}
        title="migrate_dmo_to_prod"
        message="migrate_dmo_to_prod_confirm"
        variant="warning"
        confirmText="migrate_to_prod"
        loading={isMigrating}
        onConfirm={handleMigrateConfirm}
        onCancel={() => setMigrateTarget(null)}
      />

      {isCreateModalOpen && (
        <CreateDmoWizardModal
          setIsOpen={setIsCreateModalOpen}
          dmoId={editDmoId}
        />
      )}
    </div>
  );
};

export default DmosMgmtPage;
