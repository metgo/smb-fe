import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";

import { useGetDmosQuery } from "@/store/api/masterDataApi";
import { ConfirmDialog, PageHeader } from "@/components/shared";
import { routes } from "@/lib/routes";
import { CreateDmoWizardModal, DmoCard } from "./components";

const DmosMgmtPage = () => {
  const navigate = useNavigate();
  const { data, refetch, isFetching } = useGetDmosQuery();

  const [deleteTarget, setDeleteTarget] = useState<IDmo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [migrateTarget, setMigrateTarget] = useState<IDmo | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const dmos: IDmo[] = data?.data ?? [];

  const handleEdit = (dmo: IDmo) => {
    // TODO: open edit modal
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
        onRefreshClick={refetch}
        isRefreshing={isFetching}
      />

      {dmos.length === 0 && !isFetching ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Building2 className="w-12 h-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-1">No DMOs found</p>
          <p className="text-sm text-gray-400">Add a DMO to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1">
          {dmos.map((dmo) => (
            <DmoCard
              key={dmo._id}
              dmo={dmo}
              onEdit={() => handleEdit(dmo)}
              onDelete={() => setDeleteTarget(dmo)}
              onGoToAuthorities={() => handleGoToAuthorities(dmo)}
              onMigrateToProd={() => handleMigrateToProd(dmo)}
            />
          ))}
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
