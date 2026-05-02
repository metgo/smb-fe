import clsx from "clsx";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Edit,
  Trash2,
  ArrowRight,
  UploadCloud,
  Users,
} from "lucide-react";

import { useGetDmosQuery } from "@/store/api/masterDataApi";
import { ConfirmDialog, PageHeader, EntityCard } from "@/components/shared";
import { useThemeClasses } from "@/hooks/useThemeClasses";
import { routes } from "@/lib/routes";
import { CreateDmoWizardModal } from "./components";

const DmosMgmtPage = () => {
  const navigate = useNavigate();
  const { data, isFetching } = useGetDmosQuery();
  const { textTertiary } = useThemeClasses();

  const [deleteTarget, setDeleteTarget] = useState<IDmo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [migrateTarget, setMigrateTarget] = useState<IDmo | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const dmos: IDmo[] = data?.data ?? [];

  const handleEdit = (dmo: IDmo) => {
    setIsCreateModalOpen(true);
    console.log("edit", dmo._id);
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

  const handleGoToAuthorities = (dmo: IDmo) => {
    navigate(`${routes.authorityMgmt}?dmoId=${dmo._id}`);
  };

  const handleMigrateToProd = (dmo: IDmo) => {
    setMigrateTarget(dmo);
  };

  const handleToggleActive = (dmo: IDmo) => {
    // TODO: call toggle active mutation
    console.log("toggle active", dmo._id, !dmo.isActive);
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
        totalCount={dmos.length}
        btnLabel="Add DMO"
        onClick={() => setIsCreateModalOpen(true)}
      />

      {dmos.length === 0 && !isFetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Building2 className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-1">No DMOs found</p>
          <p className="text-sm text-gray-400">Add a DMO to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
          {dmos.map((dmo) => {
            const authorityCount = dmo.authorities?.length ?? 0;
            return (
              <EntityCard
                key={dmo._id}
                logo={dmo.logoPath}
                name={dmo.name}
                fallbackIcon={<Building2 className="w-12 h-12 text-gray-400" />}
                isActive={dmo.isActive ?? false}
                onToggleActive={() => handleToggleActive(dmo)}
                actions={[
                  {
                    title: "Edit",
                    colorClass:
                      "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",
                    onClick: () => handleEdit(dmo),
                    icon: <Edit size={14} />,
                  },
                  {
                    title: "Delete",
                    colorClass:
                      "text-red-400 bg-red-500/10 hover:bg-red-500/20",
                    onClick: () => setDeleteTarget(dmo),
                    icon: <Trash2 size={14} />,
                  },
                  {
                    title: "Migrate to Prod",
                    colorClass:
                      "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20",
                    onClick: () => handleMigrateToProd(dmo),
                    icon: <UploadCloud size={14} />,
                  },
                ]}
              >
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-500" />
                  <span className={clsx("text-xs font-medium", textTertiary)}>
                    {authorityCount}{" "}
                    {authorityCount === 1 ? "Authority" : "Authorities"}
                  </span>
                  <button
                    title="View Authorities"
                    onClick={() => handleGoToAuthorities(dmo)}
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
        <CreateDmoWizardModal setIsOpen={setIsCreateModalOpen} />
      )}
    </div>
  );
};

export default DmosMgmtPage;
