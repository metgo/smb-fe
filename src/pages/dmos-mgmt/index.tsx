import clsx from "clsx";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ArrowRight,
  Users,
} from "lucide-react";

import { routes } from "@/lib/routes";
import { CreateDmoWizardModal } from "./components";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { ConfirmDialog, PageHeader, EntityCard, Spinner } from "@/components/shared";
import { useGetAllDmosQuery, useUpdateDmoMutation } from "@/store/api/websiteConfigApi";

const DmosMgmtPage = () => {
  const navigate = useNavigate();
  const { textTertiary } = useThemeClasses();
  const [updateDmo, { isLoading: isUpdating }] = useUpdateDmoMutation();

  const { data: dmos, refetch, isFetching, isLoading } = useGetAllDmosQuery();

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [migrateTarget, setMigrateTarget] = useState<IDmo | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editDmoId, setEditDmoId] = useState<string | undefined>()


  const handleEdit = (dmoId: string) => {
    setEditDmoId(dmoId)
    setIsCreateModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // TODO: call delete mutation
      console.log("delete", deleteTarget);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleGoToAuthorities = (dmoId: string) => {
    navigate(`${routes.authorityMgmt}?dmoId=${dmoId}`);
  };

  const handleMigrateToProd = (dmoId: string) => {
    console.log("🚀 ~ handleMigrateToProd ~ dmoId:", dmoId)
    // setMigrateTarget(dmo);
  };

  const handleToggleActive = async (dmoId: string, isActive: boolean = false) => {
    try {
      await updateDmo({ id: dmoId, body: { isActive: isActive } }).unwrap();
      toast.success("DMO updated successfully");
      refetch()
    } catch {
      toast.error(dmoId ? "Failed to update DMO" : "Failed to create DMO");
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
    <div className="flex flex-col h-full">
      <PageHeader
        title="DMO Management"
        h1Gradient="text-transparent bg-gradient-to-r from-teal-500 to-cyan-500"
        totalCount={dmos?.length}
        btnLabel="Add DMO"
        onClick={() => setIsCreateModalOpen(true)}
      />
      <Spinner isLoading={isLoading || isFetching || isUpdating} />

      {dmos?.length === 0 && !isFetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Building2 className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-1">No DMOs found</p>
          <p className="text-sm text-gray-400">Add a DMO to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
          {dmos?.map((dmo) => {
            return (
              <EntityCard
                key={dmo._id}
                logo={dmo.logoPath}
                name={dmo.name}
                fallbackIcon={<Building2 className="w-12 h-12 text-gray-400" />}
                isActive={dmo?.isActive ?? false}
                onToggleActive={() => handleToggleActive(dmo?._id, !dmo?.isActive)}
                onEdit={() => handleEdit(dmo?._id)}
                onDelete={() => setDeleteTarget(dmo?._id)}
                onMigrateToProd={() => handleMigrateToProd(dmo?._id)}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-500" />
                  <span className={clsx("text-xs font-medium", textTertiary)}>
                    {dmo?.authorityCount}{" "}
                    {dmo?.authorityCount === 1 ? "Authority" : "Authorities"}
                  </span>
                  <button
                    title="View Authorities"
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
        <CreateDmoWizardModal setIsOpen={setIsCreateModalOpen} dmoId={editDmoId} />
      )}
    </div>
  );
};

export default DmosMgmtPage;
